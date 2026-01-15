import { z } from "@hono/zod-openapi";

const envSchema = z.object({
	SERVER_HOST: z.string().min(1, "SERVER_HOST is required"),
	PORT: z.coerce.number().int().positive().default(3001),
	GRPC_PORT: z.coerce.number().int().positive().default(50051),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(rawEnv: NodeJS.ProcessEnv = process.env): Env {
	const result = envSchema.safeParse(rawEnv);
	if (!result.success) {
		const message = result.error.errors.map((err) => err.message).join(", ");
		throw new Error(`Invalid environment configuration: ${message}`);
	}
	return result.data;
}

export const env = loadEnv();
