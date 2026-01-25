import {
	createRoute,
	OpenAPIHono,
	type RouteConfigToTypedResponse,
} from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { buildApiBaseUrl, getHostForGrpc, serverConfig } from "./config/server";
import { db } from "./db";
import { isApiError } from "./http/errors";
import { errorResponse, successResponse } from "./http/responses";
import { logError } from "./lib/logger";
import {
	ConfigResponse,
	ErrorResponse,
	HealthResponse,
	SimpleHealthResponse,
} from "./openapi/schemas";
import enrollmentRoutes from "./routes/enrollment";
import instanceRoutes from "./routes/instances";
import { sql } from "drizzle-orm";

type AppEnv = {
	Variables: {
		requestId: string;
	};
};

const app = new OpenAPIHono<AppEnv>();
const apiVersion = "v1";
const apiBasePath = `/${apiVersion}`;

app.use("*", logger());
app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
	}),
);
app.use("*", async (c, next) => {
	const incomingId = c.req.header("x-request-id");
	const requestId = incomingId || crypto.randomUUID();
	c.set("requestId", requestId);
	c.header("x-request-id", requestId);
	await next();
});

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return errorResponse(c, err.status as ContentfulStatusCode, err.message);
	}

	if (isApiError(err)) {
		return errorResponse(c, err.status as ContentfulStatusCode, err.message);
	}

	const requestId = c.get("requestId");
	logError("HTTP unhandled error", { error: err, requestId });
	return errorResponse(c, 500, "Internal Server Error");
});

app.doc(`${apiBasePath}/openapi.json`, {
	openapi: "3.0.0",
	info: {
		title: "Omnii API",
		version: "1.0.0",
	},
	servers: [
		{
			url: buildApiBaseUrl(),
		},
	],
});

app.get(
	"/docs",
	Scalar({
		url: `${apiBasePath}/openapi.json`,
	}),
);

// Simple liveness probe - no dependencies checked
const livenessRoute = createRoute({
	method: "get",
	path: "/health",
	tags: ["Health"],
	responses: {
		200: {
			content: {
				"application/json": { schema: SimpleHealthResponse },
			},
			description: "Service is alive",
		},
	},
});

app.openapi(
	livenessRoute,
	(c): RouteConfigToTypedResponse<typeof livenessRoute> => {
		return successResponse(c, {
			status: "ok",
		}) as unknown as RouteConfigToTypedResponse<typeof livenessRoute>;
	},
);

// Readiness probe - checks database connectivity
const readinessRoute = createRoute({
	method: "get",
	path: `${apiBasePath}/health`,
	tags: ["Health"],
	responses: {
		200: {
			content: {
				"application/json": { schema: HealthResponse },
			},
			description: "Service is ready",
		},
		503: {
			content: {
				"application/json": { schema: ErrorResponse },
			},
			description: "Service is not ready",
		},
	},
});

app.openapi(
	readinessRoute,
	async (c): Promise<RouteConfigToTypedResponse<typeof readinessRoute>> => {
		try {
			// Check database connectivity
			await db.execute(sql`SELECT 1`);

			return successResponse(c, {
				status: "ok",
				service: "omnii-server",
				version: "1.0.0",
			}) as unknown as RouteConfigToTypedResponse<typeof readinessRoute>;
		} catch (_error) {
			return errorResponse(
				c,
				503,
				"Database connection failed",
			) as unknown as RouteConfigToTypedResponse<typeof readinessRoute>;
		}
	},
);

const configRoute = createRoute({
	method: "get",
	path: `${apiBasePath}/config`,
	tags: ["Config"],
	responses: {
		200: {
			content: {
				"application/json": { schema: ConfigResponse },
			},
			description: "Frontend configuration",
		},
		500: {
			content: {
				"application/json": { schema: ErrorResponse },
			},
			description: "Internal server error",
		},
	},
});

app.openapi(
	configRoute,
	(c): RouteConfigToTypedResponse<typeof configRoute> => {
		return successResponse(c, {
			apiBaseUrl: `${buildApiBaseUrl()}${apiBasePath}`,
			grpcAddress: `${getHostForGrpc()}:${serverConfig.grpcPort}`,
		}) as unknown as RouteConfigToTypedResponse<typeof configRoute>;
	},
);

app.route(apiBasePath, enrollmentRoutes);
app.route(apiBasePath, instanceRoutes);

export default app;
