import { Hono } from "hono";
import { cors } from "hono/cors";
import { lt } from "drizzle-orm";
import enrollmentRoutes from "./routes/enrollment";
import instanceRoutes from "./routes/instances";
import { startGrpcServer } from "./grpc/server";
import { db, heartbeats } from "./db";

// Initialize database (migrations run automatically)
console.log("Initializing database...");

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

const serverHost = process.env.SERVER_HOST;
if (!serverHost) {
  throw new Error("SERVER_HOST is not set");
}
const port = parseInt(process.env.PORT || "3001", 10);
const grpcPort = parseInt(process.env.GRPC_PORT || "50051", 10);

function getHostForGrpc(): string {
  if (serverHost.startsWith("http://") || serverHost.startsWith("https://")) {
    try {
      return new URL(serverHost).hostname;
    } catch {
      return serverHost.replace(/^https?:\/\//, "");
    }
  }
  return serverHost;
}

function buildApiBaseUrl(): string {
  if (serverHost.startsWith("http://") || serverHost.startsWith("https://")) {
    return serverHost;
  }
  return `http://${serverHost}:${port}`;
}

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

// Frontend config (API base URL)
app.get("/config", (c) => {
  return c.json({
    apiBaseUrl: buildApiBaseUrl(),
    grpcAddress: `${getHostForGrpc()}:${grpcPort}`,
  });
});

// Register routes
app.route("/", enrollmentRoutes);
app.route("/", instanceRoutes);

// Start gRPC server
setTimeout(async () => {
  try {
    // Get gRPC port from environment
    const grpcPort = parseInt(process.env.GRPC_PORT || "50051", 10);
    
    // Start the gRPC server
    await startGrpcServer(grpcPort);
    console.log(`gRPC server started on port ${grpcPort}`);
  } catch (error) {
    console.error("Failed to start gRPC server:", error);
  }
}, 1000);

// Cleanup old heartbeats (older than 24 hours)
async function cleanupOldHeartbeats() {
  try {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    const result = await db.delete(heartbeats).where(lt(heartbeats.timestamp, cutoffTime));
    console.log(`[Cleanup] Deleted old heartbeats (before ${new Date(cutoffTime).toISOString()})`);
  } catch (error) {
    console.error("[Cleanup] Failed to delete old heartbeats:", error);
  }
}

// Run cleanup every hour
setInterval(cleanupOldHeartbeats, 60 * 60 * 1000);
// Run initial cleanup after 5 seconds
setTimeout(cleanupOldHeartbeats, 5000);

console.log(`Server starting on port ${port}...`);

Bun.serve({
  port,
  fetch(req) {
    return app.fetch(req);
  },
});
