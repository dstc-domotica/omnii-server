import {
	createRoute,
	OpenAPIHono,
	type RouteConfigToTypedResponse,
} from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { buildApiBaseUrl, getHostForGrpc, serverConfig } from "./config/server";
import { isApiError } from "./http/errors";
import { errorResponse, successResponse } from "./http/responses";
import {
	ConfigResponse,
	ErrorResponse,
	HealthResponse,
	SimpleHealthResponse,
} from "./openapi/schemas";
import enrollmentRoutes from "./routes/enrollment";
import instanceRoutes from "./routes/instances";

type AppEnv = {
	Variables: {
		requestId: string;
	};
};

const app = new OpenAPIHono<AppEnv>();

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
	console.error(`[HTTP] Unhandled error (${requestId ?? "unknown"}):`, err);
	return errorResponse(c, 500, "Internal Server Error");
});

app.doc("/openapi.json", {
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
	apiReference({
		spec: {
			url: "/openapi.json",
		},
	} as Parameters<typeof apiReference>[0]),
);

const rootHealthRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Health"],
	responses: {
		200: {
			content: {
				"application/json": { schema: HealthResponse },
			},
			description: "Service status",
		},
	},
});

app.openapi(
	rootHealthRoute,
	(c): RouteConfigToTypedResponse<typeof rootHealthRoute> => {
		return successResponse(c, {
			status: "ok",
			service: "Omnii Server",
			version: "1.0.0",
		}) as unknown as RouteConfigToTypedResponse<typeof rootHealthRoute>;
	},
);

const healthRoute = createRoute({
	method: "get",
	path: "/health",
	tags: ["Health"],
	responses: {
		200: {
			content: {
				"application/json": { schema: SimpleHealthResponse },
			},
			description: "Health check",
		},
	},
});

app.openapi(
	healthRoute,
	(c): RouteConfigToTypedResponse<typeof healthRoute> => {
		return successResponse(c, {
			status: "healthy",
		}) as unknown as RouteConfigToTypedResponse<typeof healthRoute>;
	},
);

const configRoute = createRoute({
	method: "get",
	path: "/config",
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
			apiBaseUrl: buildApiBaseUrl(),
			grpcAddress: `${getHostForGrpc()}:${serverConfig.grpcPort}`,
		}) as unknown as RouteConfigToTypedResponse<typeof configRoute>;
	},
);

app.route("/", enrollmentRoutes);
app.route("/", instanceRoutes);

export default app;
