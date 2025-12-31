import { db, enrollmentCodes, instances } from "../db";
import { eq, and, isNull, gt } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface EnrollmentCodeResult {
  code: string;
  expiresAt: number;
  id: string;
}

export interface EnrollmentResult {
  instanceId: string;
  mqttClientId: string;
  mqttBrokerUrl: string;
  topics: {
    status: string;
    heartbeat: string;
    metrics: string;
    commands: string;
  };
}

/**
 * Generate a numeric enrollment code (6-8 digits)
 */
export function generateEnrollmentCode(): string {
  // Generate 6-digit numeric code
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Create a new enrollment code
 */
export async function createEnrollmentCode(
  expiresInHours: number = 24
): Promise<EnrollmentCodeResult> {
  const code = generateEnrollmentCode();
  const id = randomBytes(16).toString("hex");
  const createdAt = Date.now();
  const expiresAt = createdAt + expiresInHours * 60 * 60 * 1000;

  await db.insert(enrollmentCodes).values({
    id,
    code,
    createdAt,
    expiresAt,
  });

  return { code, expiresAt, id };
}

/**
 * Validate and use an enrollment code
 */
export async function validateEnrollmentCode(
  code: string
): Promise<{ valid: boolean; enrollmentCodeId?: string; error?: string }> {
  const result = await db
    .select()
    .from(enrollmentCodes)
    .where(
      and(
        eq(enrollmentCodes.code, code),
        isNull(enrollmentCodes.usedAt),
        gt(enrollmentCodes.expiresAt, Date.now())
      )
    )
    .limit(1);

  if (result.length === 0) {
    return { valid: false, error: "Invalid or expired enrollment code" };
  }

  return { valid: true, enrollmentCodeId: result[0].id };
}

/**
 * Mark enrollment code as used
 */
export async function markEnrollmentCodeAsUsed(
  enrollmentCodeId: string,
  instanceId: string
): Promise<void> {
  await db
    .update(enrollmentCodes)
    .set({ usedAt: Date.now(), instanceId })
    .where(eq(enrollmentCodes.id, enrollmentCodeId));
}

/**
 * Enroll a new instance
 */
export async function enrollInstance(
  code: string,
  name: string
): Promise<EnrollmentResult> {
  // Validate code
  const validation = await validateEnrollmentCode(code);
  if (!validation.valid || !validation.enrollmentCodeId) {
    throw new Error(validation.error || "Invalid enrollment code");
  }

  // Create instance
  const instanceId = randomBytes(16).toString("hex");
  const mqttClientId = `ha-instance-${instanceId.substring(0, 8)}`;
  const enrolledAt = Date.now();

  await db.insert(instances).values({
    id: instanceId,
    name,
    enrollmentCode: code,
    enrolledAt,
    mqttClientId,
    status: "offline",
    createdAt: enrolledAt,
    updatedAt: enrolledAt,
  });

  // Mark code as used
  await markEnrollmentCodeAsUsed(validation.enrollmentCodeId, instanceId);

  // Get MQTT broker URL from environment or use default
  const mqttBrokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";

  return {
    instanceId,
    mqttClientId,
    mqttBrokerUrl,
    topics: {
      status: `ha-instances/${instanceId}/status`,
      heartbeat: `ha-instances/${instanceId}/heartbeat`,
      metrics: `ha-instances/${instanceId}/metrics`,
      commands: `server/${instanceId}/commands`,
    },
  };
}

/**
 * Get all active enrollment codes
 */
export async function getActiveEnrollmentCodes() {
  return await db
    .select()
    .from(enrollmentCodes)
    .where(
      and(
        isNull(enrollmentCodes.usedAt),
        gt(enrollmentCodes.expiresAt, Date.now())
      )
    )
    .orderBy(enrollmentCodes.createdAt);
}

