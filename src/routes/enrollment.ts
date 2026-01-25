import {
	createRoute,
	OpenAPIHono,
	type RouteConfigToTypedResponse,
	z,
} from "@hono/zod-openapi";
import { errorResponse, successResponse } from "../http/responses";
import {
	createPaginatedResponse,
	DeactivateEnrollmentResult,
	EnrollmentCodeCreateResponse,
	EnrollmentCodeRecord,
	ErrorResponse,
	PaginationParams,
} from "../openapi/schemas";
import {
	createEnrollmentCode,
	deactivateEnrollmentCode,
	getActiveEnrollmentCodes,
	getAllEnrollmentCodes,
	getAllEnrollmentCodesPaginated,
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
		query: z
			.object({
				all: z.enum(["true", "false"]).optional(),
			})
			.merge(PaginationParams.partial()),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.union([
						z.array(EnrollmentCodeRecord),
						createPaginatedResponse(EnrollmentCodeRecord),
					]),
				},
			},
			description: "Enrollment codes (paginated when all=true with page/limit)",
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
			const { all, page, limit } = c.req.valid("query");
			const includeAll = all === "true";

			// If requesting all codes with pagination params, use paginated response
			if (includeAll && (page !== undefined || limit !== undefined)) {
				const result = await getAllEnrollmentCodesPaginated(
					page ?? 1,
					limit ?? 20,
				);
				return successResponse(c, {
					data: result.data,
					pagination: result.pagination,
				}) as unknown as RouteConfigToTypedResponse<
					typeof listEnrollmentCodesRoute
				>;
			}

			// Otherwise return simple array (backwards compatible)
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
