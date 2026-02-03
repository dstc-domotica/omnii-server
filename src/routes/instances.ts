import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { isApiError } from "../http/errors";
import { errorResponse, successResponse } from "../http/responses";
import {
	createPaginatedResponse,
	DeleteInstanceResult,
	ErrorResponse,
	HeartbeatRecord,
	ConnectivityRecord,
	InstancePublic,
	InstanceStatsRecord,
	InstanceSystemInfoRecord,
	InstanceUpdateRecord,
	PaginationParams,
	TriggerUpdateBody,
	TriggerUpdateResult,
} from "../openapi/schemas";
import {
	deleteInstance,
	getAvailableUpdates,
	getInstanceConnectivityChecks,
	getInstanceHeartbeats,
	getInstanceStats,
	getSystemInfo,
	listInstancesPaginated,
	requireInstance,
	toInstancePublic,
	triggerInstanceUpdate,
} from "../services/instances";

const app = new OpenAPIHono();

function handleRouteError(
	c: Parameters<typeof errorResponse>[0],
	error: unknown,
) {
	if (isApiError(error)) {
		return errorResponse(
			c,
			error.status as ContentfulStatusCode,
			error.message,
		);
	}
	return errorResponse(c, 500, "Internal Server Error");
}

app.openapi(
	createRoute({
		method: "get",
		path: "/instances",
		tags: ["Instances"],
		request: {
			query: PaginationParams.partial(),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: createPaginatedResponse(InstancePublic),
					},
				},
				description: "Paginated instances list",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to fetch instances",
			},
		},
	}),
	async (c) => {
		try {
			const { page = 1, limit = 20 } = c.req.valid("query");
			const result = await listInstancesPaginated(page, limit);
			return successResponse(c, {
				data: result.data.map(toInstancePublic),
				pagination: result.pagination,
			});
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "get",
		path: "/instances/{id}",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": { schema: InstancePublic },
				},
				description: "Instance details",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to fetch instance",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			const instance = await requireInstance(instanceId);
			return successResponse(c, toInstancePublic(instance));
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "get",
		path: "/instances/{id}/system-info",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.union([InstanceSystemInfoRecord, z.null()]),
					},
				},
				description: "Instance system info",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to fetch system info",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			const systemInfo = await getSystemInfo(instanceId);
			return successResponse(c, systemInfo);
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "get",
		path: "/instances/{id}/updates",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(InstanceUpdateRecord),
					},
				},
				description: "Instance updates",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to fetch updates",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			const updates = await getAvailableUpdates(instanceId);
			return successResponse(c, updates);
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "post",
		path: "/instances/{id}/trigger-update",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: TriggerUpdateBody,
					},
				},
			},
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: TriggerUpdateResult,
					},
				},
				description: "Update triggered",
			},
			400: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Invalid request",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to trigger update",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			const body = c.req.valid("json");
			const { updateType, addonSlug } = body;
			const result = await triggerInstanceUpdate(
				instanceId,
				updateType,
				addonSlug,
			);
			return successResponse(c, {
				message: result.message || "Update triggered",
			});
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "get",
		path: "/instances/{id}/heartbeats",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
			query: z.object({
				minutes: z.coerce.number().int().min(1).optional(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(HeartbeatRecord),
					},
				},
				description: "Instance heartbeats",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to fetch heartbeats",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			const { minutes } = c.req.valid("query");
			const instanceHeartbeats = await getInstanceHeartbeats(
				instanceId,
				minutes ?? 60,
			);
			return successResponse(c, instanceHeartbeats);
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "get",
		path: "/instances/{id}/connectivity",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
			query: z.object({
				minutes: z.coerce.number().int().min(1).optional(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(ConnectivityRecord),
					},
				},
				description: "Instance connectivity checks",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to fetch connectivity checks",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			const { minutes } = c.req.valid("query");
			const checks = await getInstanceConnectivityChecks(
				instanceId,
				minutes ?? 60,
			);
			return successResponse(c, checks);
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "get",
		path: "/instances/{id}/stats",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
			query: z.object({
				minutes: z.coerce.number().int().min(1).optional(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(InstanceStatsRecord),
					},
				},
				description: "Instance stats (CPU, memory, network, etc.)",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to fetch stats",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			const { minutes } = c.req.valid("query");
			const stats = await getInstanceStats(instanceId, minutes ?? 60);
			return successResponse(c, stats);
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

app.openapi(
	createRoute({
		method: "delete",
		path: "/instances/{id}",
		tags: ["Instances"],
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: DeleteInstanceResult,
					},
				},
				description: "Instance deleted",
			},
			404: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Instance not found",
			},
			500: {
				content: {
					"application/json": { schema: ErrorResponse },
				},
				description: "Failed to delete instance",
			},
		},
	}),
	async (c) => {
		try {
			const { id: instanceId } = c.req.valid("param");
			await deleteInstance(instanceId);
			return successResponse(c, { message: "Instance deleted" });
		} catch (error) {
			return handleRouteError(c, error);
		}
	},
);

export default app;
