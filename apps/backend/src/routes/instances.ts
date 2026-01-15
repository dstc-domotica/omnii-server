import { Hono } from "hono";
import { db, instances, heartbeats, instanceSystemInfo, instanceUpdates } from "../db";
import { eq, desc, or, and, isNull } from "drizzle-orm";
import { isAddonConnected, requestUpdateFromAddon } from "../grpc/server";

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
 * GET /instances/:id/system-info
 * Get system information for a specific instance
 */
app.get("/instances/:id/system-info", async (c) => {
  try {
    const instanceId = c.req.param("id");

    // Verify instance exists
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, instanceId))
      .limit(1);

    if (instance.length === 0) {
      return c.json({ error: "Instance not found" }, 404);
    }

    // Get system info
    const systemInfo = await db
      .select()
      .from(instanceSystemInfo)
      .where(eq(instanceSystemInfo.instanceId, instanceId))
      .limit(1);

    if (systemInfo.length === 0) {
      return c.json(null);
    }

    return c.json(systemInfo[0]);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch system info" }, 500);
  }
});

/**
 * GET /instances/:id/updates
 * Get available updates for a specific instance
 */
app.get("/instances/:id/updates", async (c) => {
  try {
    const instanceId = c.req.param("id");

    // Verify instance exists
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, instanceId))
      .limit(1);

    if (instance.length === 0) {
      return c.json({ error: "Instance not found" }, 404);
    }

    // Get available updates
    const updates = await db
      .select()
      .from(instanceUpdates)
      .where(
        and(
          eq(instanceUpdates.instanceId, instanceId),
          or(
            eq(instanceUpdates.updateAvailable, 1),
            isNull(instanceUpdates.updateAvailable)
          )
        )
      )
      .orderBy(desc(instanceUpdates.createdAt));

    return c.json(updates);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch updates" }, 500);
  }
});

/**
 * POST /instances/:id/trigger-update
 * Trigger an update on the instance
 * Body: { updateType: string, addonSlug?: string }
 */
app.post("/instances/:id/trigger-update", async (c) => {
  try {
    const instanceId = c.req.param("id");
    const body = await c.req.json();
    const { updateType, addonSlug } = body;

    if (!updateType) {
      return c.json({ error: "Missing required field: updateType" }, 400);
    }

    // Validate updateType
    if (!["core", "os", "supervisor", "addon"].includes(updateType)) {
      return c.json({ error: "Invalid updateType. Must be one of: core, os, supervisor, addon" }, 400);
    }

    // If addon, require addonSlug
    if (updateType === "addon" && !addonSlug) {
      return c.json({ error: "addonSlug is required for addon updates" }, 400);
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

    // Check if instance is connected
    if (!isAddonConnected(instanceId)) {
      return c.json({ error: "Instance is not connected" }, 400);
    }

    // Request update from addon
    const result = await requestUpdateFromAddon(instanceId, updateType, addonSlug || "");

    if (result.success) {
      return c.json({ success: true, message: result.message || "Update triggered" });
    } else {
      return c.json({ error: result.error || "Failed to trigger update" }, 500);
    }
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to trigger update" }, 500);
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
 * DELETE /instances/:id
 * Delete an instance and all associated data
 */
app.delete("/instances/:id", async (c) => {
  try {
    const instanceId = c.req.param("id");

    // Verify instance exists
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, instanceId))
      .limit(1);

    if (instance.length === 0) {
      return c.json({ error: "Instance not found" }, 404);
    }

    // Delete associated system info
    await db.delete(instanceSystemInfo).where(eq(instanceSystemInfo.instanceId, instanceId));

    // Delete associated updates
    await db.delete(instanceUpdates).where(eq(instanceUpdates.instanceId, instanceId));

    // Delete associated heartbeats
    await db.delete(heartbeats).where(eq(heartbeats.instanceId, instanceId));

    // Delete the instance
    await db.delete(instances).where(eq(instances.id, instanceId));

    return c.json({ success: true, message: "Instance deleted" });
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to delete instance" }, 500);
  }
});

export default app;
