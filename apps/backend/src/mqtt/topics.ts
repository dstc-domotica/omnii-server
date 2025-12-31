/**
 * MQTT Topic Structure
 * 
 * Client → Server topics:
 * - ha-instances/{instance_id}/status - Status updates
 * - ha-instances/{instance_id}/heartbeat - Periodic heartbeats
 * - ha-instances/{instance_id}/metrics - Detailed metrics
 * 
 * Server → Client topics:
 * - server/{instance_id}/commands - Server commands to instances
 */

export function getStatusTopic(instanceId: string): string {
  return `ha-instances/${instanceId}/status`;
}

export function getHeartbeatTopic(instanceId: string): string {
  return `ha-instances/${instanceId}/heartbeat`;
}

export function getMetricsTopic(instanceId: string): string {
  return `ha-instances/${instanceId}/metrics`;
}

export function getCommandsTopic(instanceId: string): string {
  return `server/${instanceId}/commands`;
}

/**
 * Subscribe to all instance topics using wildcards
 */
export function getSubscriptionTopics(): string[] {
  return [
    "ha-instances/+/status",
    "ha-instances/+/heartbeat",
    "ha-instances/+/metrics",
  ];
}

/**
 * Extract instance ID from topic
 */
export function extractInstanceIdFromTopic(topic: string): string | null {
  const match = topic.match(/ha-instances\/([^/]+)\/(status|heartbeat|metrics)/);
  return match ? match[1] : null;
}

