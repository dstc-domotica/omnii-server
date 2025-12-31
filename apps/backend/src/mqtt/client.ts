import mqtt, { MqttClient } from "mqtt";
import { getSubscriptionTopics } from "./topics";
import { handleMqttMessage } from "./handler";

let client: MqttClient | null = null;

export function connectMqttClient(): MqttClient {
  if (client && client.connected) {
    return client;
  }

  const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
  const clientId = `omnii-server-${Date.now()}`;

  console.log(`Connecting to MQTT broker at ${brokerUrl}...`);

  client = mqtt.connect(brokerUrl, {
    clientId,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  });

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    
    // Subscribe to all instance topics
    const topics = getSubscriptionTopics();
    topics.forEach((topic) => {
      client?.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });
  });

  client.on("message", (topic, message) => {
    handleMqttMessage(topic, message);
  });

  client.on("error", (error) => {
    console.error("MQTT client error:", error);
  });

  client.on("close", () => {
    console.log("MQTT client disconnected");
  });

  client.on("reconnect", () => {
    console.log("Reconnecting to MQTT broker...");
  });

  return client;
}

export function getMqttClient(): MqttClient | null {
  return client;
}

export function publishCommand(instanceId: string, command: any): void {
  if (!client || !client.connected) {
    console.error("MQTT client not connected");
    return;
  }

  const topic = `server/${instanceId}/commands`;
  const payload = JSON.stringify(command);

  client.publish(topic, payload, { qos: 1 }, (error) => {
    if (error) {
      console.error(`Failed to publish command to ${topic}:`, error);
    } else {
      console.log(`Published command to ${topic}`);
    }
  });
}

export function disconnectMqttClient(): void {
  if (client) {
    client.end();
    client = null;
  }
}

