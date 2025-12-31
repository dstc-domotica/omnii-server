import { Hono } from "hono";
import {
  createEnrollmentCode,
  enrollInstance,
  getActiveEnrollmentCodes,
} from "../services/enrollment";

const app = new Hono();

/**
 * POST /enroll
 * Enroll a new Home Assistant instance
 * Body: { code: string, name: string }
 */
app.post("/enroll", async (c) => {
  try {
    const body = await c.req.json();
    const { code, name } = body;

    if (!code || !name) {
      return c.json({ error: "Missing required fields: code, name" }, 400);
    }

    const result = await enrollInstance(code, name);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || "Enrollment failed" }, 400);
  }
});

/**
 * POST /enrollment-codes
 * Generate a new enrollment code
 * Body (optional): { expiresInHours: number }
 */
app.post("/enrollment-codes", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const expiresInHours = body.expiresInHours || 24;

    const result = await createEnrollmentCode(expiresInHours);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to create enrollment code" }, 500);
  }
});

/**
 * GET /enrollment-codes
 * List all active enrollment codes
 */
app.get("/enrollment-codes", async (c) => {
  try {
    const codes = await getActiveEnrollmentCodes();
    return c.json(codes);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch enrollment codes" }, 500);
  }
});

export default app;

