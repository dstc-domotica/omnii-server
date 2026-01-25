import { readFileSync } from "node:fs";
import * as grpc from "@grpc/grpc-js";
import { env } from "../config/env";
import { logError, logInfo, logWarn } from "../lib/logger";
import { incrementMetric } from "../lib/metrics";
import {
	generateAccessToken,
	revokeAccessTokenForRefresh,
	rotateRefreshToken,
	trackAccessTokenForRefresh,
	validateRefreshToken,
	verifyAccessToken,
} from "../services/auth";
import { enrollInstance } from "../services/enrollment";
import {
	recordHeartbeat,
	recordConnectivityChecks,
	recordStatsReport,
	updateInstanceStatus,
	updateReportedUpdates,
	upsertSystemInfo,
} from "../services/instances";
import {
	type IOmniiServiceServer,
	OmniiServiceService,
} from "./generated/omnnii_grpc_pb";
import {
	type EnrollRequest,
	EnrollResponse,
	type HeartbeatRequest,
	HeartbeatResponse,
	PendingUpdate,
	type ConnectivityReportRequest,
	ConnectivityReportResponse,
	type RefreshTokenRequest,
	RefreshTokenResponse,
	type StatsReportRequest,
	StatsReportResponse,
	type TriggerUpdateRequest,
	TriggerUpdateResponse,
	type UpdateReportRequest,
	UpdateReportResponse,
} from "./generated/omnnii_pb";

const ACTIVE_INSTANCE_TIMEOUT_MS = 5 * 60 * 1000;
const activeInstances = new Map<string, number>();
const rateLimitBuckets = new Map<
	string,
	{ windowStart: number; count: number }
>();

// Pending update triggers (maps instanceId -> { updateType, addonSlug, resolve, reject })
interface PendingUpdateTrigger {
	updateType: string;
	addonSlug: string;
	resolve: (response: TriggerUpdateResponse) => void;
	reject: (error: Error) => void;
	timeout: ReturnType<typeof setTimeout>;
}
const pendingUpdateTriggers = new Map<string, PendingUpdateTrigger>();

interface AuthContext {
	instanceId: string;
	tokenId: string;
	issuedAt: number;
	expiresAt: number;
}

function extractBearerToken(metadata: grpc.Metadata): string | null {
	const values = metadata.get("authorization");
	if (!values.length) {
		return null;
	}
	const raw = values[0];
	const header = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw);
	if (!header.startsWith("Bearer ")) {
		return null;
	}
	return header.slice("Bearer ".length).trim();
}

async function authenticateCall<TRequest, TResponse>(
	call: grpc.ServerUnaryCall<TRequest, TResponse>,
	callback: grpc.sendUnaryData<TResponse>,
): Promise<AuthContext | null> {
	const token = extractBearerToken(call.metadata);
	if (!token) {
		incrementMetric("auth_failure");
		sendGrpcError(
			callback,
			grpc.status.UNAUTHENTICATED,
			"Missing access token",
		);
		return null;
	}

	const claims = await verifyAccessToken(token);
	if (!claims) {
		incrementMetric("auth_failure");
		sendGrpcError(
			callback,
			grpc.status.UNAUTHENTICATED,
			"Invalid access token",
		);
		return null;
	}

	incrementMetric("auth_success");
	return {
		instanceId: claims.sub,
		tokenId: claims.jti,
		issuedAt: claims.iat,
		expiresAt: claims.exp,
	};
}

type AuthedUnaryHandler<TRequest, TResponse> = (
	auth: AuthContext,
	call: grpc.ServerUnaryCall<TRequest, TResponse>,
	callback: grpc.sendUnaryData<TResponse>,
) => Promise<void>;

function withAuth<TRequest, TResponse>(
	handler: AuthedUnaryHandler<TRequest, TResponse>,
): grpc.handleUnaryCall<TRequest, TResponse> {
	return async (call, callback) => {
		const auth = await authenticateCall(call, callback);
		if (!auth) {
			return;
		}
		await handler(auth, call, callback);
	};
}

function sendGrpcError<TResponse>(
	callback: grpc.sendUnaryData<TResponse>,
	code: grpc.status,
	message: string,
): void {
	callback({ code, message }, null);
}

function consumeRateLimit(
	key: string,
	limit: number,
	windowMs: number,
): boolean {
	const now = Date.now();
	const entry = rateLimitBuckets.get(key);
	if (!entry || now - entry.windowStart >= windowMs) {
		rateLimitBuckets.set(key, { windowStart: now, count: 1 });
		return true;
	}
	if (entry.count >= limit) {
		return false;
	}
	entry.count += 1;
	return true;
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
		callback: grpc.sendUnaryData<EnrollResponse>,
	) => {
		const rateKey = `enroll:${call.getPeer()}`;
		if (!consumeRateLimit(rateKey, 5, 60_000)) {
			incrementMetric("auth_rate_limited");
			sendGrpcError(
				callback,
				grpc.status.RESOURCE_EXHAUSTED,
				"Rate limit exceeded",
			);
			return;
		}

		const request = call.request;
		const code = request.getCode();

		logInfo("gRPC enroll request received", {
			codeMasked: `${code}`.slice(-2),
		});

		const response = new EnrollResponse();

		try {
			// Use the existing enrollment service
			const result = await enrollInstance(code);

			response.setSuccess(true);
			response.setError("");
			response.setInstanceId(result.instanceId);
			response.setAccessToken(result.accessToken);
			response.setRefreshToken(result.refreshToken);
			response.setAccessTokenExpiresAt(result.accessTokenExpiresAt);

			logInfo("gRPC enrollment successful", { instanceId: result.instanceId });
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Enrollment failed";
			logWarn("gRPC enrollment failed", { reason: message });
			response.setSuccess(false);
			response.setError(message);
			response.setInstanceId("");
			response.setAccessToken("");
			response.setRefreshToken("");
			response.setAccessTokenExpiresAt(0);
		}

		callback(null, response);
	},

	/**
	 * RefreshToken - Exchange refresh token for a new access token
	 */
	refreshToken: async (
		call: grpc.ServerUnaryCall<RefreshTokenRequest, RefreshTokenResponse>,
		callback: grpc.sendUnaryData<RefreshTokenResponse>,
	) => {
		const rateKey = `refresh:${call.getPeer()}`;
		if (!consumeRateLimit(rateKey, 20, 60_000)) {
			incrementMetric("auth_rate_limited");
			sendGrpcError(
				callback,
				grpc.status.RESOURCE_EXHAUSTED,
				"Rate limit exceeded",
			);
			return;
		}

		const request = call.request;
		const refreshToken = request.getRefreshToken();

		logInfo("gRPC refresh token request received");

		const response = new RefreshTokenResponse();

		if (!refreshToken) {
			incrementMetric("refresh_failure");
			response.setSuccess(false);
			response.setError("Missing refresh token");
			response.setAccessToken("");
			response.setRefreshToken("");
			response.setAccessTokenExpiresAt(0);
			callback(null, response);
			return;
		}

		const record = await validateRefreshToken(refreshToken);
		if (!record) {
			incrementMetric("refresh_failure");
			response.setSuccess(false);
			response.setError("Invalid refresh token");
			response.setAccessToken("");
			response.setRefreshToken("");
			response.setAccessTokenExpiresAt(0);
			callback(null, response);
			return;
		}

		revokeAccessTokenForRefresh(record.id);
		const accessTokenResult = await generateAccessToken(record.instanceId);
		const rotated = await rotateRefreshToken(record);
		trackAccessTokenForRefresh(rotated.record.id, accessTokenResult);
		incrementMetric("refresh_success");
		response.setSuccess(true);
		response.setError("");
		response.setAccessToken(accessTokenResult.token);
		response.setRefreshToken(rotated.token);
		response.setAccessTokenExpiresAt(accessTokenResult.expiresAt);
		callback(null, response);
	},

	/**
	 * Heartbeat - Keep-alive from addon, now includes system info
	 */
	heartbeat: withAuth(
		async (
			auth,
			call: grpc.ServerUnaryCall<HeartbeatRequest, HeartbeatResponse>,
			callback: grpc.sendUnaryData<HeartbeatResponse>,
		) => {
			const serverReceiveTime = Date.now();
			const request = call.request;
			const clientTimestamp = request.getClientTimestamp();

			const instanceId = auth.instanceId;
			const response = new HeartbeatResponse();

			// Calculate latency if client timestamp is provided
			let latencyMs: number | undefined;
			if (clientTimestamp && clientTimestamp > 0) {
				// Round-trip estimate: (server receive time - client send time)
				// This gives us one-way latency approximation
				latencyMs = Math.max(0, serverReceiveTime - clientTimestamp);
			}

			// Mark instance active
			activeInstances.set(instanceId, Date.now());

			// Record heartbeat in database with latency
			await recordHeartbeat(instanceId, latencyMs);
			await updateInstanceStatus(instanceId, "online");

			// Process system info if provided
			const systemInfo = request.getSystemInfo();
			if (systemInfo) {
				await upsertSystemInfo(instanceId, {
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
				logInfo("gRPC updated system info", { instanceId });
			}

			response.setAlive(true);
			response.setTime(Date.now());
			response.setLatencyMs(latencyMs ?? 0);

			// Check for pending update triggers
			const pendingTrigger = getPendingUpdateTrigger(instanceId);
			if (pendingTrigger) {
				const pendingUpdate = new PendingUpdate();
				pendingUpdate.setHasUpdate(true);
				pendingUpdate.setUpdateType(pendingTrigger.updateType);
				pendingUpdate.setAddonSlug(pendingTrigger.addonSlug);
				response.setPendingUpdate(pendingUpdate);
				logInfo("gRPC heartbeat includes pending update", {
					instanceId,
					updateType: pendingTrigger.updateType,
				});
			}

			callback(null, response);
		},
	),

	/**
	 * ReportUpdates - Report update snapshot for the instance
	 */
	reportUpdates: withAuth(
		async (
			auth,
			call: grpc.ServerUnaryCall<UpdateReportRequest, UpdateReportResponse>,
			callback: grpc.sendUnaryData<UpdateReportResponse>,
		) => {
			const request = call.request;

			const instanceId = auth.instanceId;
			const response = new UpdateReportResponse();

			const report = request.getReport();
			if (!report) {
				response.setAccepted(false);
				response.setMessage("Missing report");
				callback(null, response);
				return;
			}

			const components = report.getComponentsList();
			activeInstances.set(instanceId, Date.now());
			await updateReportedUpdates(instanceId, {
				generatedAtSeconds: report.getGeneratedAt(),
				components: components.map((component) => ({
					componentType: component.getComponentType(),
					slug: component.getSlug(),
					name: component.getName(),
					version: component.getVersion(),
					versionLatest: component.getVersionLatest(),
					updateAvailable: component.getUpdateAvailable(),
				})),
			});

			logInfo("gRPC updated reported updates", {
				instanceId,
				componentCount: components.length,
			});
			response.setAccepted(true);
			response.setMessage("Update report accepted");
			callback(null, response);
		},
	),

	/**
	 * ReportStats - Report core stats snapshot for the instance
	 */
	reportStats: withAuth(
		async (
			auth,
			call: grpc.ServerUnaryCall<StatsReportRequest, StatsReportResponse>,
			callback: grpc.sendUnaryData<StatsReportResponse>,
		) => {
			const request = call.request;

			const instanceId = auth.instanceId;
			const response = new StatsReportResponse();

			const report = request.getReport();
			if (!report) {
				response.setAccepted(false);
				response.setMessage("Missing report");
				callback(null, response);
				return;
			}

			const stats = report.getStats();
			if (!stats) {
				response.setAccepted(false);
				response.setMessage("Missing stats");
				callback(null, response);
				return;
			}

			activeInstances.set(instanceId, Date.now());
			await recordStatsReport(instanceId, {
				generatedAtSeconds: report.getGeneratedAt(),
				stats: {
					cpuPercent: stats.getCpuPercent(),
					memoryUsage: stats.getMemoryUsage(),
					memoryLimit: stats.getMemoryLimit(),
					memoryPercent: stats.getMemoryPercent(),
					networkTx: stats.getNetworkTx(),
					networkRx: stats.getNetworkRx(),
					blkRead: stats.getBlkRead(),
					blkWrite: stats.getBlkWrite(),
				},
			});

			logInfo("gRPC recorded stats report", { instanceId });
			response.setAccepted(true);
			response.setMessage("Stats report accepted");
			callback(null, response);
		},
	),

	/**
	 * ReportConnectivity - Report connectivity probes for the instance
	 */
	reportConnectivity: withAuth(
		async (
			auth,
			call: grpc.ServerUnaryCall<
				ConnectivityReportRequest,
				ConnectivityReportResponse
			>,
			callback: grpc.sendUnaryData<ConnectivityReportResponse>,
		) => {
			const request = call.request;

			const instanceId = auth.instanceId;
			const response = new ConnectivityReportResponse();

			const checks = request.getChecksList();
			activeInstances.set(instanceId, Date.now());

			await recordConnectivityChecks(instanceId, {
				publicIp: request.getPublicIp() || null,
				checks: checks.map((check) => {
					const latencyValue = check.getLatencyMs();
					const errorValue = check.getError();
					return {
						target: check.getTarget(),
						status: check.getStatus(),
						latencyMs: latencyValue > 0 ? latencyValue : null,
						error: errorValue ? errorValue : null,
					};
				}),
			});

			response.setAccepted(true);
			response.setMessage("Connectivity report accepted");
			callback(null, response);
		},
	),

	/**
	 * TriggerUpdate - Addon reports the result of executing an update
	 * This is called by the addon after processing a pending update request
	 */
	triggerUpdate: withAuth(
		async (
			auth,
			call: grpc.ServerUnaryCall<TriggerUpdateRequest, TriggerUpdateResponse>,
			callback: grpc.sendUnaryData<TriggerUpdateResponse>,
		) => {
			const request = call.request;
			const updateType = request.getUpdateType();
			const addonSlug = request.getAddonSlug();
			const success = request.getSuccess();
			const error = request.getError();
			const message = request.getMessage();

			const instanceId = auth.instanceId;

			logInfo("gRPC trigger update result received", {
				instanceId,
				updateType,
				addonSlug,
				success,
				error: error || undefined,
			});

			const response = new TriggerUpdateResponse();

			activeInstances.set(instanceId, Date.now());

			// Complete the pending trigger - this resolves the promise in requestUpdateFromAddon
			completePendingUpdateTrigger(instanceId, {
				success,
				error: error || undefined,
				message: message || undefined,
			});

			response.setAccepted(true);
			response.setMessage("Update result received");
			callback(null, response);
		},
	),
};

/**
 * Request an update from a connected addon
 * Returns a promise that resolves when the addon responds
 */
export async function requestUpdateFromAddon(
	instanceId: string,
	updateType: string,
	addonSlug: string = "",
): Promise<{ success: boolean; error?: string; message?: string }> {
	if (!isAddonConnected(instanceId)) {
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
				// Response is resolved via completePendingUpdateTrigger
				resolve({
					success: response.getAccepted(),
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
export function getPendingUpdateTrigger(
	instanceId: string,
): { updateType: string; addonSlug: string } | null {
	const pending = pendingUpdateTriggers.get(instanceId);
	if (!pending) return null;
	return { updateType: pending.updateType, addonSlug: pending.addonSlug };
}

/**
 * Complete a pending update trigger with result from addon
 */
export function completePendingUpdateTrigger(
	instanceId: string,
	result: { success: boolean; error?: string; message?: string },
): void {
	const pending = pendingUpdateTriggers.get(instanceId);
	if (pending) {
		clearTimeout(pending.timeout);
		pendingUpdateTriggers.delete(instanceId);
		// Resolve with the result from the addon
		const response = new TriggerUpdateResponse();
		response.setAccepted(result.success);
		response.setMessage(result.message || result.error || "");
		pending.resolve(response);
	}
}

/**
 * Check if an addon is connected
 */
export function isAddonConnected(instanceId: string): boolean {
	const lastSeen = activeInstances.get(instanceId);
	if (!lastSeen) {
		return false;
	}
	return Date.now() - lastSeen <= ACTIVE_INSTANCE_TIMEOUT_MS;
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
		let credentials: grpc.ServerCredentials;
		try {
			const cert = readFileSync(env.GRPC_TLS_CERT_PATH);
			const key = readFileSync(env.GRPC_TLS_KEY_PATH);
			credentials = grpc.ServerCredentials.createSsl(
				null,
				[{ private_key: key, cert_chain: cert }],
				false,
			);
			logInfo("gRPC TLS enabled", {
				certPath: env.GRPC_TLS_CERT_PATH,
			});
		} catch (error) {
			logError("gRPC failed to load TLS cert/key", { error });
			reject(error);
			return;
		}
		grpcServer.bindAsync(address, credentials, (error, boundPort) => {
			if (error) {
				logError("gRPC failed to bind server", { error });
				reject(error);
				return;
			}

			logInfo("gRPC server listening", { port: boundPort });
			resolve();
		});
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

		activeInstances.clear();
		pendingUpdateTriggers.clear();

		grpcServer.tryShutdown((error) => {
			if (error) {
				logError("gRPC error during shutdown", { error });
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
		activeSessions: activeInstances.size,
	};
}
