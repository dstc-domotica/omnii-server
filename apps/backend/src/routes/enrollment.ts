import { Hono } from "hono";
import {
  createEnrollmentCode,
  getActiveEnrollmentCodes,
  getAllEnrollmentCodes,
  deactivateEnrollmentCode,
} from "../services/enrollment";

const app = new Hono();

// NOTE: Enrollment is now done via gRPC only (Enroll RPC)
// The HTTP POST /enroll endpoint has been removed

/**
 * POST /enrollment-codes
 * Generate a new enrollment code (always 1 hour validity)
 */
app.post("/enrollment-codes", async (c) => {
  try {
    const result = await createEnrollmentCode();
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to create enrollment code" }, 500);
  }
});

/**
 * GET /enrollment-codes
 * List all enrollment codes (including used and expired)
 * Query param: all=true to get all codes, otherwise only active codes
 */
app.get("/enrollment-codes", async (c) => {
  try {
    const all = c.req.query("all") === "true";
    const codes = all ? await getAllEnrollmentCodes() : await getActiveEnrollmentCodes();
    return c.json(codes);
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to fetch enrollment codes" }, 500);
  }
});

/**
 * POST /enrollment-codes/:id/deactivate
 * Deactivate an enrollment code
 */
app.post("/enrollment-codes/:id/deactivate", async (c) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Missing enrollment code ID" }, 400);
    }

    await deactivateEnrollmentCode(id);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || "Failed to deactivate enrollment code" }, 500);
  }
});

export default app;

