import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { env } from "../config/env";
import { db, instanceRefreshTokens } from "../db";

const ACCESS_TOKEN_TTL_SECONDS = env.ACCESS_TOKEN_TTL_SECONDS;
const REFRESH_TOKEN_TTL_DAYS = env.REFRESH_TOKEN_TTL_DAYS;

interface AccessTokenClaims {
	sub: string;
	iat: number;
	exp: number;
	jti: string;
}

interface AccessTokenResult {
	token: string;
	expiresAt: number;
	jti: string;
}

interface RefreshTokenRecord {
	id: string;
	instanceId: string;
	expiresAt: number | null;
	revokedAt: number | null;
}

interface RefreshTokenAccessRecord {
	jti: string;
	expiresAt: number;
}

const jwtKey = new TextEncoder().encode(env.GRPC_AUTH_SECRET);
const revokedAccessTokens = new Map<string, number>();
const refreshTokenAccess = new Map<string, RefreshTokenAccessRecord>();

export async function generateAccessToken(
	instanceId: string,
): Promise<AccessTokenResult> {
	const nowSeconds = Math.floor(Date.now() / 1000);
	const expiresAt = nowSeconds + ACCESS_TOKEN_TTL_SECONDS;
	const jti = randomBytes(16).toString("hex");
	const token = await new SignJWT({})
		.setProtectedHeader({ alg: "HS256", typ: "JWT" })
		.setSubject(instanceId)
		.setIssuedAt(nowSeconds)
		.setExpirationTime(expiresAt)
		.setJti(jti)
		.sign(jwtKey);
	return { token, expiresAt, jti };
}

export async function verifyAccessToken(
	token: string,
): Promise<AccessTokenClaims | null> {
	try {
		const { payload } = await jwtVerify(token, jwtKey, {
			algorithms: ["HS256"],
		});
		if (!payload.sub || !payload.exp || !payload.iat || !payload.jti) {
			return null;
		}
		const jti = String(payload.jti);
		const exp = Number(payload.exp);
		if (isAccessTokenRevoked(jti)) {
			return null;
		}
		return {
			sub: payload.sub,
			iat: Number(payload.iat),
			exp,
			jti,
		};
	} catch {
		return null;
	}
}

export function revokeAccessToken(jti: string, expiresAt: number): void {
	revokedAccessTokens.set(jti, expiresAt);
}

export function trackAccessTokenForRefresh(
	refreshTokenId: string,
	accessToken: AccessTokenResult,
): void {
	refreshTokenAccess.set(refreshTokenId, {
		jti: accessToken.jti,
		expiresAt: accessToken.expiresAt,
	});
}

export function revokeAccessTokenForRefresh(refreshTokenId: string): void {
	const record = refreshTokenAccess.get(refreshTokenId);
	if (!record) {
		return;
	}
	refreshTokenAccess.delete(refreshTokenId);
	revokeAccessToken(record.jti, record.expiresAt);
}

function isAccessTokenRevoked(jti: string): boolean {
	const expiresAt = revokedAccessTokens.get(jti);
	if (!expiresAt) {
		return false;
	}
	if (expiresAt * 1000 <= Date.now()) {
		revokedAccessTokens.delete(jti);
		return false;
	}
	return true;
}

export function generateRefreshToken(): string {
	return randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

export async function storeRefreshToken(
	instanceId: string,
	refreshToken: string,
): Promise<RefreshTokenRecord> {
	const id = randomBytes(16).toString("hex");
	const expiresAt = REFRESH_TOKEN_TTL_DAYS
		? Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
		: null;
	const tokenHash = hashRefreshToken(refreshToken);

	await db.insert(instanceRefreshTokens).values({
		id,
		instanceId,
		tokenHash,
		expiresAt,
		createdAt: Date.now(),
	});

	return { id, instanceId, expiresAt, revokedAt: null };
}

export async function rotateRefreshToken(
	record: RefreshTokenRecord,
): Promise<{ token: string; record: RefreshTokenRecord }> {
	await revokeRefreshToken(record.id);
	const newToken = generateRefreshToken();
	const newRecord = await storeRefreshToken(record.instanceId, newToken);
	return { token: newToken, record: newRecord };
}

export async function validateRefreshToken(
	refreshToken: string,
): Promise<RefreshTokenRecord | null> {
	const tokenHash = hashRefreshToken(refreshToken);
	const now = Date.now();

	const result = await db
		.select()
		.from(instanceRefreshTokens)
		.where(
			and(
				eq(instanceRefreshTokens.tokenHash, tokenHash),
				isNull(instanceRefreshTokens.revokedAt),
				or(
					isNull(instanceRefreshTokens.expiresAt),
					gt(instanceRefreshTokens.expiresAt, now),
				),
			),
		)
		.limit(1);

	const record = result[0];
	if (!record) {
		return null;
	}

	if (record.expiresAt && record.expiresAt <= now) {
		return null;
	}

	await db
		.update(instanceRefreshTokens)
		.set({ lastUsedAt: now })
		.where(eq(instanceRefreshTokens.id, record.id));

	return {
		id: record.id,
		instanceId: record.instanceId,
		expiresAt: record.expiresAt ?? null,
		revokedAt: record.revokedAt ?? null,
	};
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
	await db
		.update(instanceRefreshTokens)
		.set({ revokedAt: Date.now() })
		.where(eq(instanceRefreshTokens.id, tokenId));
}
