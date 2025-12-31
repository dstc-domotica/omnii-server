import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db";
import enrollmentRoutes from "./routes/enrollment";
import instanceRoutes from "./routes/instances";
import { connectMqttClient } from "./mqtt/client";
import { handleWebSocket } from "./websocket";

// Initialize database (migrations run automatically)
console.log("Initializing database...");

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Health check
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    service: "Omnii Server",
    version: "1.0.0"
  });
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "healthy" });
});

// Register routes
app.route("/", enrollmentRoutes);
app.route("/", instanceRoutes);

// WebSocket endpoint
app.get("/ws", (c) => {
  return handleWebSocket(c.req.raw);
});

// Connect to MQTT broker
console.log("Connecting to MQTT broker...");
connectMqttClient();

const port = parseInt(process.env.PORT || "3001", 10);

console.log(`Server starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
