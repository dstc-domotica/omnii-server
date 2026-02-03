import { z } from "@hono/zod-openapi";

const envSchema = z.object({
	SERVER_HOST: z.string().min(1, "SERVER_HOST is required"),
	PORT: z.coerce.number().int().positive().default(3001),
	GRPC_PORT: z.coerce.number().int().positive().default(50051),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	GRPC_AUTH_SECRET: z.string().min(32, "GRPC_AUTH_SECRET is required"),
	ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
	REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().optional(),
	GRPC_TLS_CERT_PATH: z.string().min(1, "GRPC_TLS_CERT_PATH is required"),
	GRPC_TLS_KEY_PATH: z.string().min(1, "GRPC_TLS_KEY_PATH is required"),
	// Data retention settings (in days)
	RETENTION_HEARTBEATS_DAYS: z.coerce.number().int().positive().default(7),
	RETENTION_CONNECTIVITY_DAYS: z.coerce.number().int().positive().default(7),
	RETENTION_STATS_DAYS: z.coerce.number().int().positive().default(30),
	// Cleanup interval in minutes (default: 60 minutes = 1 hour)
	RETENTION_CLEANUP_INTERVAL_MINUTES: z.coerce
		.number()
		.int()
		.positive()
		.default(60),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(rawEnv: NodeJS.ProcessEnv = process.env): Env {
	const result = envSchema.safeParse(rawEnv);
	if (!result.success) {
		const message = result.error.issues.map((err) => err.message).join(", ");
		throw new Error(`Invalid environment configuration: ${message}`);
	}
	return result.data;
}

export const env = loadEnv();
