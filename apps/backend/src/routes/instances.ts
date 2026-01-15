import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { isApiError } from "../http/errors";
import { errorResponse, successResponse } from "../http/responses";
import {
	DeleteInstanceResult,
	ErrorResponse,
	HeartbeatRecord,
	InstancePublic,
	InstanceSystemInfoRecord,
	InstanceUpdateRecord,
	successEnvelope,
	TriggerUpdateBody,
	TriggerUpdateResult,
} from "../openapi/schemas";
import {
	deleteInstance,
	getAvailableUpdates,
	getInstanceHeartbeats,
	getSystemInfo,
	listInstances,
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
		return errorResponse(c, error.status, error.message, error.code);
	}
	return errorResponse(c, 500, "Internal Server Error");
}

app.openapi(
	createRoute({
		method: "get",
		path: "/instances",
		tags: ["Instances"],
		responses: {
			200: {
				content: {
					"application/json": {
						schema: successEnvelope(z.array(InstancePublic)),
					},
				},
				description: "Instances list",
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
			const allInstances = await listInstances();
			const payload = allInstances.map(toInstancePublic);
			return successResponse(c, payload);
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
					"application/json": { schema: successEnvelope(InstancePublic) },
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
						schema: successEnvelope(
							z.union([InstanceSystemInfoRecord, z.null()]),
						),
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
						schema: successEnvelope(z.array(InstanceUpdateRecord)),
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
						schema: successEnvelope(TriggerUpdateResult),
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
				limit: z.coerce.number().int().min(1).optional(),
			}),
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: successEnvelope(z.array(HeartbeatRecord)),
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
			const { limit } = c.req.valid("query");
			const instanceHeartbeats = await getInstanceHeartbeats(
				instanceId,
				limit ?? 100,
			);
			return successResponse(c, instanceHeartbeats);
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
						schema: successEnvelope(DeleteInstanceResult),
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
