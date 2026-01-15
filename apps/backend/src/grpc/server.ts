import * as grpc from "@grpc/grpc-js";
import { randomBytes } from "crypto";
import { db, instances, heartbeats, instanceSystemInfo, instanceUpdates } from "../db";
import { eq } from "drizzle-orm";
import {
  OmniiServiceService,
  type IOmniiServiceServer,
} from "./generated/omnnii_grpc_pb";
import {
  EnrollRequest,
  EnrollResponse,
  HandshakeRequest,
  HandshakeResponse,
  HeartbeatRequest,
  HeartbeatResponse,
  UpdateReportRequest,
  UpdateReportResponse,
  TriggerUpdateRequest,
  TriggerUpdateResponse,
} from "./generated/omnnii_pb";
import { enrollInstance } from "../services/enrollment";

// In-memory session store (maps session_id -> { instanceId, connectedAt })
interface Session {
  instanceId: string;
  connectedAt: number;
  lastHeartbeat: number;
}

const sessions = new Map<string, Session>();

// Pending update triggers (maps instanceId -> { updateType, addonSlug, resolve, reject })
interface PendingUpdateTrigger {
  updateType: string;
  addonSlug: string;
  resolve: (response: TriggerUpdateResponse) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}
const pendingUpdateTriggers = new Map<string, PendingUpdateTrigger>();

/**
 * Validate addon token against the database
 */
async function validateToken(addonId: string, token: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(instances)
      .where(eq(instances.id, addonId))
      .limit(1);

    if (result.length === 0) {
      console.log(`[gRPC] Unknown addon_id: ${addonId}`);
      return false;
    }

    const instance = result[0];
    if (instance.token !== token) {
      console.log(`[gRPC] Invalid token for addon_id: ${addonId}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[gRPC] Token validation error:`, error);
    return false;
  }
}

/**
 * Update instance status in the database
 */
async function updateInstanceStatus(instanceId: string, status: "online" | "offline" | "error"): Promise<void> {
  try {
    await db
      .update(instances)
      .set({
        status,
        lastSeen: Date.now(),
        updatedAt: Date.now(),
      })
      .where(eq(instances.id, instanceId));
  } catch (error) {
    console.error(`[gRPC] Failed to update instance status:`, error);
  }
}

/**
 * Record heartbeat in the database
 */
async function recordHeartbeat(instanceId: string, latencyMs?: number): Promise<void> {
  try {
    await db.insert(heartbeats).values({
      id: randomBytes(16).toString("hex"),
      instanceId,
      timestamp: Date.now(),
      status: "online",
      latencyMs: latencyMs ?? null,
    });

    await db
      .update(instances)
      .set({
        lastSeen: Date.now(),
        updatedAt: Date.now(),
      })
      .where(eq(instances.id, instanceId));
  } catch (error) {
    console.error(`[gRPC] Failed to record heartbeat:`, error);
  }
}

/**
 * Upsert system info for an instance
 */
async function upsertSystemInfo(instanceId: string, systemInfo: {
  supervisor: string;
  homeassistant: string;
  hassos: string;
  docker: string;
  hostname: string;
  operatingSystem: string;
  machine: string;
  arch: string;
  channel: string;
  state: string;
}): Promise<void> {
  try {
    // Check if record exists
    const existing = await db
      .select()
      .from(instanceSystemInfo)
      .where(eq(instanceSystemInfo.instanceId, instanceId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(instanceSystemInfo)
        .set({
          supervisor: systemInfo.supervisor,
          homeassistant: systemInfo.homeassistant,
          hassos: systemInfo.hassos,
          docker: systemInfo.docker,
          hostname: systemInfo.hostname,
          operatingSystem: systemInfo.operatingSystem,
          machine: systemInfo.machine,
          arch: systemInfo.arch,
          channel: systemInfo.channel,
          state: systemInfo.state,
          updatedAt: Date.now(),
        })
        .where(eq(instanceSystemInfo.instanceId, instanceId));
    } else {
      // Insert new
      await db.insert(instanceSystemInfo).values({
        id: randomBytes(16).toString("hex"),
        instanceId,
        supervisor: systemInfo.supervisor,
        homeassistant: systemInfo.homeassistant,
        hassos: systemInfo.hassos,
        docker: systemInfo.docker,
        hostname: systemInfo.hostname,
        operatingSystem: systemInfo.operatingSystem,
        machine: systemInfo.machine,
        arch: systemInfo.arch,
        channel: systemInfo.channel,
        state: systemInfo.state,
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error(`[gRPC] Failed to upsert system info:`, error);
  }
}

/**
 * Update reported updates for an instance (replace all)
 */
async function updateReportedUpdates(
  instanceId: string,
  report: {
    generatedAtSeconds: number;
    components: Array<{
      componentType: string;
      slug: string;
      name: string;
      version: string;
      versionLatest: string;
      updateAvailable: boolean;
    }>;
  }
): Promise<void> {
  try {
    // Delete existing updates for this instance
    await db.delete(instanceUpdates).where(eq(instanceUpdates.instanceId, instanceId));

    const generatedAtMs = report.generatedAtSeconds > 0 ? report.generatedAtSeconds * 1000 : null;
    const availableUpdates = report.components.filter(component => component.updateAvailable);

    // Insert new updates
    if (availableUpdates.length > 0) {
      await db.insert(instanceUpdates).values(
        availableUpdates.map(update => ({
          id: randomBytes(16).toString("hex"),
          instanceId,
          updateType: update.componentType,
          slug: update.slug || null,
          name: update.name || null,
          version: update.version || null,
          versionLatest: update.versionLatest || null,
          updateAvailable: update.updateAvailable ? 1 : 0,
          reportGeneratedAt: generatedAtMs,
          icon: null,
          panelPath: null,
          createdAt: Date.now(),
        }))
      );
    }
  } catch (error) {
    console.error(`[gRPC] Failed to update reported updates:`, error);
  }
}

/**
 * gRPC Service Implementation
 */
const omniiServiceImpl: IOmniiServiceServer = {
  /**
   * Enroll - Register a new addon with an enrollment code (unauthenticated)
   */
  enroll: async (
    call: grpc.ServerUnaryCall<EnrollRequest, EnrollResponse>,
    callback: grpc.sendUnaryData<EnrollResponse>
  ) => {
    const request = call.request;
    const code = request.getCode();

    console.log(`[gRPC] Enroll request with code: ${code}`);

    const response = new EnrollResponse();

    try {
      // Use the existing enrollment service
      const result = await enrollInstance(code);

      response.setSuccess(true);
      response.setError("");
      response.setInstanceId(result.instanceId);
      response.setToken(result.token);

      console.log(`[gRPC] Enrollment successful. Instance ID: ${result.instanceId}`);
    } catch (error: any) {
      console.log(`[gRPC] Enrollment failed: ${error.message}`);
      response.setSuccess(false);
      response.setError(error.message || "Enrollment failed");
      response.setInstanceId("");
      response.setToken("");
    }

    callback(null, response);
  },

  /**
   * Handshake - Addon authenticates and gets a session
   */
  handshake: async (
    call: grpc.ServerUnaryCall<HandshakeRequest, HandshakeResponse>,
    callback: grpc.sendUnaryData<HandshakeResponse>
  ) => {
    const request = call.request;
    const addonId = request.getAddonId();
    const token = request.getToken();

    console.log(`[gRPC] Handshake request from addon_id: ${addonId}`);

    const response = new HandshakeResponse();

    // Validate token
    const isValid = await validateToken(addonId, token);
    if (!isValid) {
      response.setSessionId("");
      response.setStatus("error:invalid_credentials");
      callback(null, response);
      return;
    }

    // Generate session ID
    const sessionId = randomBytes(32).toString("hex");
    const now = Date.now();

    // Store session
    sessions.set(sessionId, {
      instanceId: addonId,
      connectedAt: now,
      lastHeartbeat: now,
    });

    // Update instance status to online
    await updateInstanceStatus(addonId, "online");

    console.log(`[gRPC] Handshake successful for addon_id: ${addonId}, session_id: ${sessionId.substring(0, 8)}...`);

    response.setSessionId(sessionId);
    response.setStatus("ok");
    callback(null, response);
  },

  /**
   * Heartbeat - Keep-alive from addon, now includes system info
   */
  heartbeat: async (
    call: grpc.ServerUnaryCall<HeartbeatRequest, HeartbeatResponse>,
    callback: grpc.sendUnaryData<HeartbeatResponse>
  ) => {
    const serverReceiveTime = Date.now();
    const request = call.request;
    const sessionId = request.getSessionId();
    const clientTimestamp = request.getClientTimestamp();

    const response = new HeartbeatResponse();

    // Validate session
    const session = sessions.get(sessionId);
    if (!session) {
      console.log(`[gRPC] Heartbeat from unknown session: ${sessionId.substring(0, 8)}...`);
      response.setAlive(false);
      response.setTime(Date.now());
      response.setLatencyMs(0);
      callback(null, response);
      return;
    }

    // Calculate latency if client timestamp is provided
    let latencyMs: number | undefined;
    if (clientTimestamp && clientTimestamp > 0) {
      // Round-trip estimate: (server receive time - client send time)
      // This gives us one-way latency approximation
      latencyMs = Math.max(0, serverReceiveTime - clientTimestamp);
    }

    // Update session heartbeat
    session.lastHeartbeat = Date.now();
    sessions.set(sessionId, session);

    // Record heartbeat in database with latency
    await recordHeartbeat(session.instanceId, latencyMs);

    // Process system info if provided
    const systemInfo = request.getSystemInfo();
    if (systemInfo) {
      await upsertSystemInfo(session.instanceId, {
        supervisor: systemInfo.getSupervisor(),
        homeassistant: systemInfo.getHomeassistant(),
        hassos: systemInfo.getHassos(),
        docker: systemInfo.getDocker(),
        hostname: systemInfo.getHostname(),
        operatingSystem: systemInfo.getOperatingSystem(),
        machine: systemInfo.getMachine(),
        arch: systemInfo.getArch(),
        channel: systemInfo.getChannel(),
        state: systemInfo.getState(),
      });
      console.log(`[gRPC] Updated system info for instance: ${session.instanceId}`);
    }

    response.setAlive(true);
    response.setTime(Date.now());
    response.setLatencyMs(latencyMs ?? 0);
    callback(null, response);
  },

  /**
   * ReportUpdates - Report update snapshot for the instance
   */
  reportUpdates: async (
    call: grpc.ServerUnaryCall<UpdateReportRequest, UpdateReportResponse>,
    callback: grpc.sendUnaryData<UpdateReportResponse>
  ) => {
    const request = call.request;
    const sessionId = request.getSessionId();

    const response = new UpdateReportResponse();

    // Validate session
    const session = sessions.get(sessionId);
    if (!session) {
      console.log(`[gRPC] Update report from unknown session: ${sessionId.substring(0, 8)}...`);
      response.setAccepted(false);
      response.setMessage("Invalid session");
      callback(null, response);
      return;
    }

    const report = request.getReport();
    if (!report) {
      response.setAccepted(false);
      response.setMessage("Missing report");
      callback(null, response);
      return;
    }

    const components = report.getComponentsList();
    await updateReportedUpdates(session.instanceId, {
      generatedAtSeconds: report.getGeneratedAt(),
      components: components.map(component => ({
        componentType: component.getComponentType(),
        slug: component.getSlug(),
        name: component.getName(),
        version: component.getVersion(),
        versionLatest: component.getVersionLatest(),
        updateAvailable: component.getUpdateAvailable(),
      })),
    });

    console.log(`[gRPC] Updated reported updates for instance: ${session.instanceId} (${components.length} components)`);
    response.setAccepted(true);
    response.setMessage("Update report accepted");
    callback(null, response);
  },

  /**
   * TriggerUpdate - Server requests addon to trigger an update
   * This is called by the addon to check for pending update requests
   */
  triggerUpdate: async (
    call: grpc.ServerUnaryCall<TriggerUpdateRequest, TriggerUpdateResponse>,
    callback: grpc.sendUnaryData<TriggerUpdateResponse>
  ) => {
    const request = call.request;
    const sessionId = request.getSessionId();
    const updateType = request.getUpdateType();
    const addonSlug = request.getAddonSlug();

    console.log(`[gRPC] TriggerUpdate request - session: ${sessionId.substring(0, 8)}..., type: ${updateType}, addon: ${addonSlug}`);

    const response = new TriggerUpdateResponse();

    // Validate session
    const session = sessions.get(sessionId);
    if (!session) {
      response.setSuccess(false);
      response.setError("Invalid session");
      response.setMessage("");
      callback(null, response);
      return;
    }

    // This RPC is called from the HTTP API through requestUpdateFromAddon
    // The actual implementation will be handled by the pending triggers mechanism
    response.setSuccess(true);
    response.setError("");
    response.setMessage("Update trigger processed");
    callback(null, response);
  },
};

/**
 * Request an update from a connected addon
 * Returns a promise that resolves when the addon responds
 */
export async function requestUpdateFromAddon(
  instanceId: string,
  updateType: string,
  addonSlug: string = ""
): Promise<{ success: boolean; error?: string; message?: string }> {
  // Find the session for this instance
  let sessionId: string | null = null;
  for (const [sid, session] of sessions) {
    if (session.instanceId === instanceId) {
      sessionId = sid;
      break;
    }
  }

  if (!sessionId) {
    return { success: false, error: "Instance not connected" };
  }

  // Store the pending trigger
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingUpdateTriggers.delete(instanceId);
      resolve({ success: false, error: "Update request timed out" });
    }, 60000); // 60 second timeout

    pendingUpdateTriggers.set(instanceId, {
      updateType,
      addonSlug,
      resolve: (response) => {
        clearTimeout(timeout);
        pendingUpdateTriggers.delete(instanceId);
        resolve({
          success: response.getSuccess(),
          error: response.getError() || undefined,
          message: response.getMessage() || undefined,
        });
      },
      reject: (error) => {
        clearTimeout(timeout);
        pendingUpdateTriggers.delete(instanceId);
        reject(error);
      },
      timeout,
    });
  });
}

/**
 * Get pending update trigger for an instance (called by addon polling)
 */
export function getPendingUpdateTrigger(instanceId: string): { updateType: string; addonSlug: string } | null {
  const pending = pendingUpdateTriggers.get(instanceId);
  if (!pending) return null;
  return { updateType: pending.updateType, addonSlug: pending.addonSlug };
}

/**
 * Complete a pending update trigger
 */
export function completePendingUpdateTrigger(instanceId: string, response: TriggerUpdateResponse): void {
  const pending = pendingUpdateTriggers.get(instanceId);
  if (pending) {
    pending.resolve(response);
  }
}

/**
 * Check if an addon is connected
 */
export function isAddonConnected(instanceId: string): boolean {
  for (const session of sessions.values()) {
    if (session.instanceId === instanceId) {
      return true;
    }
  }
  return false;
}

/**
 * Get session for an instance
 */
export function getSessionForInstance(instanceId: string): string | null {
  for (const [sessionId, session] of sessions) {
    if (session.instanceId === instanceId) {
      return sessionId;
    }
  }
  return null;
}

/**
 * gRPC Server instance
 */
let grpcServer: grpc.Server | null = null;

/**
 * Start the gRPC server
 */
export async function startGrpcServer(port: number = 50051): Promise<void> {
  return new Promise((resolve, reject) => {
    grpcServer = new grpc.Server();

    grpcServer.addService(OmniiServiceService, omniiServiceImpl);

    const address = `0.0.0.0:${port}`;
    grpcServer.bindAsync(
      address,
      grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => {
        if (error) {
          console.error(`[gRPC] Failed to bind server:`, error);
          reject(error);
          return;
        }

        console.log(`[gRPC] Server listening on port ${boundPort}`);
        resolve();
      }
    );
  });
}

/**
 * Stop the gRPC server
 */
export function stopGrpcServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!grpcServer) {
      resolve();
      return;
    }

    sessions.clear();
    pendingUpdateTriggers.clear();

    grpcServer.tryShutdown((error) => {
      if (error) {
        console.error(`[gRPC] Error during shutdown:`, error);
        grpcServer?.forceShutdown();
      }
      grpcServer = null;
      resolve();
    });
  });
}

/**
 * Get server status
 */
export function getGrpcServerStatus(): {
  running: boolean;
  activeSessions: number;
} {
  return {
    running: grpcServer !== null,
    activeSessions: sessions.size,
  };
}
