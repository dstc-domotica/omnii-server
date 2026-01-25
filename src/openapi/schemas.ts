import { z } from "@hono/zod-openapi";

export const ErrorResponse = z.object({
	message: z.string(),
});

export const HealthResponse = z.object({
	status: z.string(),
	service: z.string(),
	version: z.string(),
});

export const SimpleHealthResponse = z.object({
	status: z.string(),
});

export const ConfigResponse = z.object({
	apiBaseUrl: z.string(),
	grpcAddress: z.string(),
});

export const EnrollmentCodeCreateResponse = z.object({
	code: z.string(),
	expiresAt: z.number(),
	id: z.string(),
});

export const EnrollmentCodeRecord = z.object({
	id: z.string(),
	code: z.string(),
	instanceId: z.string().nullable(),
	createdAt: z.number(),
	expiresAt: z.number(),
	usedAt: z.number().nullable(),
	deactivatedAt: z.number().nullable(),
});

export const InstancePublic = z.object({
	id: z.string(),
	name: z.string(),
	enrolledAt: z.number().nullable(),
	status: z.string(),
	lastSeen: z.number().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

export const InstanceSystemInfoRecord = z.object({
	id: z.string(),
	instanceId: z.string(),
	supervisor: z.string().nullable(),
	homeassistant: z.string().nullable(),
	hassos: z.string().nullable(),
	docker: z.string().nullable(),
	hostname: z.string().nullable(),
	operatingSystem: z.string().nullable(),
	machine: z.string().nullable(),
	arch: z.string().nullable(),
	channel: z.string().nullable(),
	state: z.string().nullable(),
	updatedAt: z.number(),
});

export const InstanceUpdateRecord = z.object({
	id: z.string(),
	instanceId: z.string(),
	updateType: z.string(),
	slug: z.string().nullable(),
	name: z.string().nullable(),
	icon: z.string().nullable(),
	version: z.string().nullable(),
	versionLatest: z.string().nullable(),
	updateAvailable: z.number().nullable(),
	reportGeneratedAt: z.number().nullable(),
	panelPath: z.string().nullable(),
	createdAt: z.number(),
});

export const HeartbeatRecord = z.object({
	id: z.string(),
	instanceId: z.string(),
	timestamp: z.number(),
	status: z.string(),
	latencyMs: z.number().nullable(),
});

export const ConnectivityRecord = z.object({
	id: z.string(),
	instanceId: z.string(),
	timestamp: z.number(),
	target: z.string(),
	status: z.string(),
	latencyMs: z.number().nullable(),
	error: z.string().nullable(),
	publicIp: z.string().nullable(),
	ipCountry: z.string().nullable(),
	ipRegion: z.string().nullable(),
	ipCity: z.string().nullable(),
	ipIsp: z.string().nullable(),
	ipAsn: z.string().nullable(),
});

export const TriggerUpdateBody = z
	.object({
		updateType: z.enum(["core", "os", "supervisor", "addon"]),
		addonSlug: z.string().optional(),
	})
	.superRefine((value, ctx) => {
		if (value.updateType === "addon" && !value.addonSlug) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "addonSlug is required for addon updates",
				path: ["addonSlug"],
			});
		}
	});

export const TriggerUpdateResult = z.object({
	message: z.string(),
});

export const DeleteInstanceResult = z.object({
	message: z.string(),
});

export const DeactivateEnrollmentResult = z.object({
	deactivated: z.boolean(),
});
