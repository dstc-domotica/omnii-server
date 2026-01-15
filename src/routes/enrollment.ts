import {
	createRoute,
	OpenAPIHono,
	type RouteConfigToTypedResponse,
	z,
} from "@hono/zod-openapi";
import { errorResponse, successResponse } from "../http/responses";
import {
	DeactivateEnrollmentResult,
	EnrollmentCodeCreateResponse,
	EnrollmentCodeRecord,
	ErrorResponse,
} from "../openapi/schemas";
import {
	createEnrollmentCode,
	deactivateEnrollmentCode,
	getActiveEnrollmentCodes,
	getAllEnrollmentCodes,
} from "../services/enrollment";

const app = new OpenAPIHono();

// NOTE: Enrollment is now done via gRPC only (Enroll RPC)
// The HTTP POST /enroll endpoint has been removed

const createEnrollmentCodeRoute = createRoute({
	method: "post",
	path: "/enrollment-codes",
	tags: ["Enrollment"],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: EnrollmentCodeCreateResponse,
				},
			},
			description: "Enrollment code created",
		},
		500: {
			content: {
				"application/json": { schema: ErrorResponse },
			},
			description: "Failed to create enrollment code",
		},
	},
});

app.openapi(
	createEnrollmentCodeRoute,
	async (
		c,
	): Promise<RouteConfigToTypedResponse<typeof createEnrollmentCodeRoute>> => {
		try {
			const result = await createEnrollmentCode();
			return successResponse(
				c,
				result,
			) as unknown as RouteConfigToTypedResponse<
				typeof createEnrollmentCodeRoute
			>;
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to create enrollment code";
			return errorResponse(
				c,
				500,
				message,
			) as unknown as RouteConfigToTypedResponse<
				typeof createEnrollmentCodeRoute
			>;
		}
	},
);

const listEnrollmentCodesRoute = createRoute({
	method: "get",
	path: "/enrollment-codes",
	tags: ["Enrollment"],
	request: {
		query: z.object({
			all: z.enum(["true", "false"]).optional(),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.array(EnrollmentCodeRecord),
				},
			},
			description: "Enrollment codes",
		},
		500: {
			content: {
				"application/json": { schema: ErrorResponse },
			},
			description: "Failed to fetch enrollment codes",
		},
	},
});

app.openapi(
	listEnrollmentCodesRoute,
	async (
		c,
	): Promise<RouteConfigToTypedResponse<typeof listEnrollmentCodesRoute>> => {
		try {
			const { all } = c.req.valid("query");
			const includeAll = all === "true";
			const codes = includeAll
				? await getAllEnrollmentCodes()
				: await getActiveEnrollmentCodes();
			return successResponse(c, codes) as unknown as RouteConfigToTypedResponse<
				typeof listEnrollmentCodesRoute
			>;
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to fetch enrollment codes";
			return errorResponse(
				c,
				500,
				message,
			) as unknown as RouteConfigToTypedResponse<
				typeof listEnrollmentCodesRoute
			>;
		}
	},
);

const deactivateEnrollmentCodeRoute = createRoute({
	method: "post",
	path: "/enrollment-codes/{id}/deactivate",
	tags: ["Enrollment"],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: DeactivateEnrollmentResult,
				},
			},
			description: "Enrollment code deactivated",
		},
		400: {
			content: {
				"application/json": { schema: ErrorResponse },
			},
			description: "Missing enrollment code ID",
		},
		500: {
			content: {
				"application/json": { schema: ErrorResponse },
			},
			description: "Failed to deactivate enrollment code",
		},
	},
});

app.openapi(
	deactivateEnrollmentCodeRoute,
	async (
		c,
	): Promise<
		RouteConfigToTypedResponse<typeof deactivateEnrollmentCodeRoute>
	> => {
		try {
			const { id } = c.req.valid("param");
			if (!id) {
				return errorResponse(
					c,
					400,
					"Missing enrollment code ID",
				) as unknown as RouteConfigToTypedResponse<
					typeof deactivateEnrollmentCodeRoute
				>;
			}

			await deactivateEnrollmentCode(id);
			return successResponse(c, {
				deactivated: true,
			}) as unknown as RouteConfigToTypedResponse<
				typeof deactivateEnrollmentCodeRoute
			>;
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to deactivate enrollment code";
			return errorResponse(
				c,
				500,
				message,
			) as unknown as RouteConfigToTypedResponse<
				typeof deactivateEnrollmentCodeRoute
			>;
		}
	},
);

export default app;
