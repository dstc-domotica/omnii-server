import { randomBytes } from "node:crypto";
import { and, count, desc, eq, gt, isNull } from "drizzle-orm";
import { db, enrollmentCodes, instances } from "../db";
import {
	generateAccessToken,
	generateRefreshToken,
	storeRefreshToken,
	trackAccessTokenForRefresh,
} from "./auth";
import type { PaginationResult } from "./instances";

export interface EnrollmentCodeResult {
	code: string;
	expiresAt: number;
	id: string;
}

export interface EnrollmentCodeRecord {
	id: string;
	code: string;
	instanceId: string | null;
	createdAt: number;
	expiresAt: number;
	usedAt: number | null;
	deactivatedAt: number | null;
}

export interface EnrollmentResult {
	instanceId: string;
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: number;
}

/**
 * Generate a numeric enrollment code (8 digits)
 */
export function generateEnrollmentCode(): string {
	// Generate 8-digit numeric code
	const min = 10000000;
	const max = 99999999;
	return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Create a new enrollment code (always 1 hour validity)
 */
export async function createEnrollmentCode(): Promise<EnrollmentCodeResult> {
	const code = generateEnrollmentCode();
	const id = randomBytes(16).toString("hex");
	const createdAt = Date.now();
	const expiresAt = createdAt + 1 * 60 * 60 * 1000; // Always 1 hour

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
 * Marks the code as used immediately to prevent race conditions
 */
export async function validateEnrollmentCode(
	code: string,
): Promise<{ valid: boolean; enrollmentCodeId?: string; error?: string }> {
	// First, find the code
	const result = await db
		.select()
		.from(enrollmentCodes)
		.where(
			and(
				eq(enrollmentCodes.code, code),
				isNull(enrollmentCodes.usedAt),
				isNull(enrollmentCodes.deactivatedAt),
				gt(enrollmentCodes.expiresAt, Date.now()),
			),
		)
		.limit(1);

	if (result.length === 0) {
		// Check if the code exists but is deactivated
		const codeCheck = await db
			.select()
			.from(enrollmentCodes)
			.where(eq(enrollmentCodes.code, code))
			.limit(1);

		if (codeCheck.length > 0) {
			if (codeCheck[0].deactivatedAt) {
				return { valid: false, error: "Enrollment code has been deactivated" };
			}
			if (codeCheck[0].usedAt) {
				return { valid: false, error: "Enrollment code has already been used" };
			}
			if (codeCheck[0].expiresAt <= Date.now()) {
				return { valid: false, error: "Enrollment code has expired" };
			}
		}

		return { valid: false, error: "Invalid enrollment code" };
	}

	// Mark as used immediately to prevent race conditions
	const now = Date.now();
	await db
		.update(enrollmentCodes)
		.set({ usedAt: now })
		.where(eq(enrollmentCodes.id, result[0].id));

	return { valid: true, enrollmentCodeId: result[0].id };
}

/**
 * Mark enrollment code as used (called after instance creation)
 * Note: The code is already marked as used in validateEnrollmentCode to prevent race conditions
 */
export async function markEnrollmentCodeAsUsed(
	enrollmentCodeId: string,
	instanceId: string,
): Promise<void> {
	await db
		.update(enrollmentCodes)
		.set({ instanceId })
		.where(eq(enrollmentCodes.id, enrollmentCodeId));
}

/**
 * Deactivate an enrollment code
 */
export async function deactivateEnrollmentCode(
	enrollmentCodeId: string,
): Promise<void> {
	await db
		.update(enrollmentCodes)
		.set({ deactivatedAt: Date.now() })
		.where(
			and(
				eq(enrollmentCodes.id, enrollmentCodeId),
				isNull(enrollmentCodes.usedAt), // Can only deactivate unused codes
			),
		);
}

/**
 * Enroll a new instance
 */
export async function enrollInstance(code: string): Promise<EnrollmentResult> {
	// Validate code
	const validation = await validateEnrollmentCode(code);
	if (!validation.valid || !validation.enrollmentCodeId) {
		throw new Error(validation.error || "Invalid enrollment code");
	}

	// Create instance ID: ha-XXXX where XXXX is exactly 4 hex digits
	// randomBytes(2) gives 2 bytes = 4 hex characters
	const hexPart = randomBytes(2).toString("hex");
	// Ensure exactly 4 hex digits (pad if needed, though randomBytes(2) should always give 4)
	const instanceId = `ha-${hexPart.padStart(4, "0")}`;
	const enrolledAt = Date.now();

	// Auto-generate instance name based on instance ID
	const name = `Home Assistant - ${instanceId}`;

	// Insert instance into database
	await db.insert(instances).values({
		id: instanceId,
		name,
		enrollmentCode: code,
		enrolledAt,
		status: "offline",
		createdAt: enrolledAt,
		updatedAt: enrolledAt,
	});

	// Mark code as used
	await markEnrollmentCodeAsUsed(validation.enrollmentCodeId, instanceId);

	// Validate all critical enrollment data before returning
	if (!instanceId || !instanceId.match(/^ha-[0-9a-f]{4}$/i)) {
		throw new Error(`Invalid instance ID format: ${instanceId}`);
	}
	const accessTokenResult = await generateAccessToken(instanceId);
	const refreshToken = generateRefreshToken();
	const refreshRecord = await storeRefreshToken(instanceId, refreshToken);
	trackAccessTokenForRefresh(refreshRecord.id, accessTokenResult);

	// Construct enrollment result
	// Note: grpcServerUrl is not included since the addon already knows it
	// (it connected to the gRPC server to call Enroll)
	const enrollmentResult: EnrollmentResult = {
		instanceId,
		accessToken: accessTokenResult.token,
		refreshToken,
		accessTokenExpiresAt: accessTokenResult.expiresAt,
	};

	return enrollmentResult;
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
				isNull(enrollmentCodes.deactivatedAt),
				gt(enrollmentCodes.expiresAt, Date.now()),
			),
		)
		.orderBy(desc(enrollmentCodes.createdAt));
}

/**
 * Get all enrollment codes (including used and expired)
 */
export async function getAllEnrollmentCodes() {
	return await db
		.select()
		.from(enrollmentCodes)
		.orderBy(desc(enrollmentCodes.createdAt));
}

/**
 * Get all enrollment codes with pagination
 */
export async function getAllEnrollmentCodesPaginated(
	page: number,
	limit: number,
): Promise<PaginationResult<EnrollmentCodeRecord>> {
	const offset = (page - 1) * limit;

	const [countResult, data] = await Promise.all([
		db.select({ count: count() }).from(enrollmentCodes),
		db
			.select()
			.from(enrollmentCodes)
			.orderBy(desc(enrollmentCodes.createdAt))
			.limit(limit)
			.offset(offset),
	]);

	const total = countResult[0]?.count ?? 0;
	const totalPages = Math.ceil(total / limit);

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	};
}
