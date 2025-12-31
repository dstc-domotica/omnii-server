import { db, instances, metrics, heartbeats } from "../db";
import { eq } from "drizzle-orm";
import { extractInstanceIdFromTopic } from "./topics";
import { randomBytes } from "crypto";
import { broadcastToInstance } from "../websocket";

interface StatusMessage {
  status: "online" | "offline" | "error";
  version?: string;
  [key: string]: any;
}

interface HeartbeatMessage {
  status: "online" | "offline" | "error";
  uptime?: number;
  [key: string]: any;
}

interface MetricsMessage {
  uptimeSeconds?: number;
  version?: string;
  stabilityScore?: number;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export async function handleMqttMessage(topic: string, message: Buffer): Promise<void> {
  try {
    const instanceId = extractInstanceIdFromTopic(topic);
    if (!instanceId) {
      console.warn(`Could not extract instance ID from topic: ${topic}`);
      return;
    }

    const payload = JSON.parse(message.toString());
    const topicType = topic.split("/").pop();

    switch (topicType) {
      case "status":
        await handleStatusMessage(instanceId, payload);
        break;
      case "heartbeat":
        await handleHeartbeatMessage(instanceId, payload);
        break;
      case "metrics":
        await handleMetricsMessage(instanceId, payload);
        break;
      default:
        console.warn(`Unknown topic type: ${topicType}`);
    }
  } catch (error: any) {
    console.error(`Error handling MQTT message from ${topic}:`, error);
  }
}

async function handleStatusMessage(instanceId: string, payload: StatusMessage): Promise<void> {
  const now = Date.now();
  
  // Update instance status
  const [updatedInstance] = await db
    .update(instances)
    .set({
      status: payload.status || "online",
      lastSeen: now,
      updatedAt: now,
      ...(payload.version && { /* version could be stored if added to schema */ }),
    })
    .where(eq(instances.id, instanceId))
    .returning();

  console.log(`Updated status for instance ${instanceId}: ${payload.status}`);

  // Broadcast to WebSocket clients
  if (updatedInstance) {
    broadcastToInstance(instanceId, {
      type: "status_change",
      data: {
        status: updatedInstance.status,
        lastSeen: updatedInstance.lastSeen,
        instance: updatedInstance,
      },
    });
  }
}

async function handleHeartbeatMessage(instanceId: string, payload: HeartbeatMessage): Promise<void> {
  const now = Date.now();
  const heartbeatId = randomBytes(16).toString("hex");

  // Insert heartbeat record
  await db.insert(heartbeats).values({
    id: heartbeatId,
    instanceId,
    timestamp: now,
    status: payload.status || "online",
  });

  // Update instance last seen
  const [updatedInstance] = await db
    .update(instances)
    .set({
      status: payload.status || "online",
      lastSeen: now,
      updatedAt: now,
    })
    .where(eq(instances.id, instanceId))
    .returning();

  console.log(`Received heartbeat from instance ${instanceId}`);

  // Broadcast to WebSocket clients
  if (updatedInstance) {
    broadcastToInstance(instanceId, {
      type: "heartbeat",
      data: {
        status: payload.status || "online",
        uptime: payload.uptime,
        lastSeen: now,
        instance: updatedInstance,
      },
    });
  }
}

async function handleMetricsMessage(instanceId: string, payload: MetricsMessage): Promise<void> {
  const now = Date.now();
  const metricId = randomBytes(16).toString("hex");

  // Insert metrics record
  const [newMetric] = await db
    .insert(metrics)
    .values({
      id: metricId,
      instanceId,
      timestamp: now,
      uptimeSeconds: payload.uptimeSeconds,
      version: payload.version,
      stabilityScore: payload.stabilityScore,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
    })
    .returning();

  // Update instance last seen
  const [updatedInstance] = await db
    .update(instances)
    .set({
      lastSeen: now,
      updatedAt: now,
    })
    .where(eq(instances.id, instanceId))
    .returning();

  console.log(`Received metrics from instance ${instanceId}`);

  // Broadcast to WebSocket clients
  if (newMetric && updatedInstance) {
    broadcastToInstance(instanceId, {
      type: "metrics",
      data: {
        metric: newMetric,
        instance: updatedInstance,
      },
    });
  }
}

