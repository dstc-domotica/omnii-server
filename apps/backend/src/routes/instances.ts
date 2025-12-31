import { Hono } from "hono";
import { db, instances, metrics, heartbeats } from "../db";
import { eq, desc } from "drizzle-orm";
import { publishCommand } from "../mqtt/client";

const app = new Hono();

/**
 * GET /instances
 * List all instances with their current status
 */
app.get("/instances", async (c) => {
  try {
    const allInstances = await db.select().from(instances).orderBy(desc(instances.createdAt));
    return c.json(allInstances);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch instances" }, 500);
  }
});

/**
 * GET /instances/:id
 * Get detailed information about a specific instance
 */
app.get("/instances/:id", async (c) => {
  try {
    const instanceId = c.req.param("id");
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, instanceId))
      .limit(1);

    if (instance.length === 0) {
      return c.json({ error: "Instance not found" }, 404);
    }

    return c.json(instance[0]);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch instance" }, 500);
  }
});

/**
 * GET /instances/:id/metrics
 * Get metrics history for a specific instance
 * Query params: limit (optional, default: 100)
 */
app.get("/instances/:id/metrics", async (c) => {
  try {
    const instanceId = c.req.param("id");
    const limit = parseInt(c.req.query("limit") || "100", 10);

    // Verify instance exists
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, instanceId))
      .limit(1);

    if (instance.length === 0) {
      return c.json({ error: "Instance not found" }, 404);
    }

    // Get metrics
    const instanceMetrics = await db
      .select()
      .from(metrics)
      .where(eq(metrics.instanceId, instanceId))
      .orderBy(desc(metrics.timestamp))
      .limit(limit);

    return c.json(instanceMetrics);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch metrics" }, 500);
  }
});

/**
 * GET /instances/:id/heartbeats
 * Get heartbeat history for a specific instance
 * Query params: limit (optional, default: 100)
 */
app.get("/instances/:id/heartbeats", async (c) => {
  try {
    const instanceId = c.req.param("id");
    const limit = parseInt(c.req.query("limit") || "100", 10);

    // Verify instance exists
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, instanceId))
      .limit(1);

    if (instance.length === 0) {
      return c.json({ error: "Instance not found" }, 404);
    }

    // Get heartbeats
    const instanceHeartbeats = await db
      .select()
      .from(heartbeats)
      .where(eq(heartbeats.instanceId, instanceId))
      .orderBy(desc(heartbeats.timestamp))
      .limit(limit);

    return c.json(instanceHeartbeats);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch heartbeats" }, 500);
  }
});

/**
 * POST /instances/:id/command
 * Send a command to an instance via MQTT
 * Body: { command: string, payload?: any }
 */
app.post("/instances/:id/command", async (c) => {
  try {
    const instanceId = c.req.param("id");
    const body = await c.req.json();
    const { command, payload } = body;

    if (!command) {
      return c.json({ error: "Missing required field: command" }, 400);
    }

    // Verify instance exists
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, instanceId))
      .limit(1);

    if (instance.length === 0) {
      return c.json({ error: "Instance not found" }, 404);
    }

    // Publish command via MQTT
    publishCommand(instanceId, {
      command,
      payload: payload || {},
      timestamp: Date.now(),
    });

    return c.json({ success: true, message: "Command sent" });
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to send command" }, 500);
  }
});

export default app;

