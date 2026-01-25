import { randomBytes } from "node:crypto";
import { and, count, desc, eq, gte, isNotNull, isNull, or } from "drizzle-orm";
import {
	db,
	connectivityChecks,
	heartbeats,
	instanceRefreshTokens,
	instanceStats,
	instanceSystemInfo,
	instances,
	instanceUpdates,
} from "../db";
import { isAddonConnected, requestUpdateFromAddon } from "../grpc/server";
import { ApiError } from "../http/errors";
import { logError } from "../lib/logger";
import type {
	HeartbeatModel,
	ConnectivityCheckModel,
	InstanceModel,
	InstanceSystemInfoModel,
	InstanceUpdateModel,
} from "../types/models";

export interface PaginationResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

type IpEnrichment = {
	ipCountry: string | null;
	ipRegion: string | null;
	ipCity: string | null;
	ipIsp: string | null;
	ipAsn: string | null;
};

async function getCachedIpEnrichment(
	publicIp: string,
): Promise<IpEnrichment | null> {
	const existing = await db
		.select()
		.from(connectivityChecks)
		.where(
			and(
				eq(connectivityChecks.publicIp, publicIp),
				isNotNull(connectivityChecks.ipCountry),
			),
		)
		.orderBy(desc(connectivityChecks.timestamp))
		.limit(1);
	const record = existing[0];
	if (!record) {
		return null;
	}
	return {
		ipCountry: record.ipCountry ?? null,
		ipRegion: record.ipRegion ?? null,
		ipCity: record.ipCity ?? null,
		ipIsp: record.ipIsp ?? null,
		ipAsn: record.ipAsn ?? null,
	};
}

async function fetchIpEnrichment(publicIp: string): Promise<IpEnrichment | null> {
	try {
		const response = await fetch(`https://ipwho.is/${publicIp}`);
		if (!response.ok) {
			logError("IP enrichment request failed", {
				publicIp,
				status: response.status,
			});
			return null;
		}
		const payload = (await response.json()) as {
			success?: boolean;
			country?: string;
			region?: string;
			city?: string;
			connection?: { isp?: string; asn?: string };
		};
		if (!payload.success) {
			return null;
		}
		return {
			ipCountry: payload.country ?? null,
			ipRegion: payload.region ?? null,
			ipCity: payload.city ?? null,
			ipIsp: payload.connection?.isp ?? null,
			ipAsn: payload.connection?.asn ?? null,
		};
	} catch (error) {
		logError("IP enrichment request failed", { error, publicIp });
		return null;
	}
}

async function resolveIpEnrichment(
	publicIp: string,
): Promise<IpEnrichment | null> {
	const cached = await getCachedIpEnrichment(publicIp);
	if (cached) {
		return cached;
	}
	return fetchIpEnrichment(publicIp);
}

export function toInstancePublic(instance: InstanceModel) {
	return {
		id: instance.id,
		name: instance.name,
		enrolledAt: instance.enrolledAt,
		status: instance.status,
		lastSeen: instance.lastSeen,
		createdAt: instance.createdAt,
		updatedAt: instance.updatedAt,
	};
}

export async function listInstances(): Promise<InstanceModel[]> {
	return db.select().from(instances).orderBy(desc(instances.createdAt));
}

export async function listInstancesPaginated(
	page: number,
	limit: number,
): Promise<PaginationResult<InstanceModel>> {
	const offset = (page - 1) * limit;

	const [countResult, data] = await Promise.all([
		db.select({ count: count() }).from(instances),
		db
			.select()
			.from(instances)
			.orderBy(desc(instances.createdAt))
			.limit(limit)
			.offset(offset),
	]);

	const total = countResult[0]?.count ?? 0;
	const totalPages = Math.ceil(total / limit);

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	};
}

export async function getInstanceById(
	instanceId: string,
): Promise<InstanceModel | null> {
	const result = await db
		.select()
		.from(instances)
		.where(eq(instances.id, instanceId))
		.limit(1);
	return result[0] ?? null;
}

export async function requireInstance(
	instanceId: string,
): Promise<InstanceModel> {
	const instance = await getInstanceById(instanceId);
	if (!instance) {
		throw new ApiError(404, "Instance not found", "INSTANCE_NOT_FOUND");
	}
	return instance;
}

export async function getSystemInfo(
	instanceId: string,
): Promise<InstanceSystemInfoModel | null> {
	await requireInstance(instanceId);
	const systemInfo = await db
		.select()
		.from(instanceSystemInfo)
		.where(eq(instanceSystemInfo.instanceId, instanceId))
		.limit(1);
	return systemInfo[0] ?? null;
}

export async function getAvailableUpdates(
	instanceId: string,
): Promise<InstanceUpdateModel[]> {
	await requireInstance(instanceId);
	return db
		.select()
		.from(instanceUpdates)
		.where(
			and(
				eq(instanceUpdates.instanceId, instanceId),
				or(
					eq(instanceUpdates.updateAvailable, 1),
					isNull(instanceUpdates.updateAvailable),
				),
			),
		)
		.orderBy(desc(instanceUpdates.createdAt));
}

export async function getInstanceHeartbeats(
	instanceId: string,
	minutes: number,
): Promise<HeartbeatModel[]> {
	await requireInstance(instanceId);
	const cutoffTime = Date.now() - minutes * 60 * 1000;
	return db
		.select()
		.from(heartbeats)
		.where(
			and(
				eq(heartbeats.instanceId, instanceId),
				gte(heartbeats.timestamp, cutoffTime),
			),
		)
		.orderBy(desc(heartbeats.timestamp));
}

export async function getInstanceConnectivityChecks(
	instanceId: string,
	minutes: number,
): Promise<ConnectivityCheckModel[]> {
	await requireInstance(instanceId);
	const cutoffTime = Date.now() - minutes * 60 * 1000;
	return db
		.select()
		.from(connectivityChecks)
		.where(
			and(
				eq(connectivityChecks.instanceId, instanceId),
				gte(connectivityChecks.timestamp, cutoffTime),
			),
		)
		.orderBy(desc(connectivityChecks.timestamp));
}

export async function triggerInstanceUpdate(
	instanceId: string,
	updateType: string,
	addonSlug: string | undefined,
): Promise<{ success: boolean; message?: string }> {
	await requireInstance(instanceId);

	if (!isAddonConnected(instanceId)) {
		throw new ApiError(
			400,
			"Instance is not connected",
			"INSTANCE_NOT_CONNECTED",
		);
	}

	const result = await requestUpdateFromAddon(
		instanceId,
		updateType,
		addonSlug || "",
	);

	if (!result.success) {
		throw new ApiError(500, result.error || "Failed to trigger update");
	}

	return {
		success: true,
		message: result.message || "Update triggered",
	};
}

export async function deleteInstance(instanceId: string): Promise<void> {
	await requireInstance(instanceId);
	await db
		.delete(instanceSystemInfo)
		.where(eq(instanceSystemInfo.instanceId, instanceId));
	await db
		.delete(instanceUpdates)
		.where(eq(instanceUpdates.instanceId, instanceId));
	await db
		.delete(instanceRefreshTokens)
		.where(eq(instanceRefreshTokens.instanceId, instanceId));
	await db
		.delete(connectivityChecks)
		.where(eq(connectivityChecks.instanceId, instanceId));
	await db.delete(heartbeats).where(eq(heartbeats.instanceId, instanceId));
	await db.delete(instances).where(eq(instances.id, instanceId));
}

export async function updateInstanceStatus(
	instanceId: string,
	status: "online" | "offline" | "error",
): Promise<void> {
	try {
		await db
			.update(instances)
			.set({
				status,
				lastSeen: Date.now(),
				updatedAt: Date.now(),
			})
			.where(eq(instances.id, instanceId));
	} catch (error) {
		logError("gRPC failed to update instance status", { error, instanceId });
	}
}

export async function recordHeartbeat(
	instanceId: string,
	latencyMs?: number,
): Promise<void> {
	try {
		await db.insert(heartbeats).values({
			id: randomBytes(16).toString("hex"),
			instanceId,
			timestamp: Date.now(),
			status: "online",
			latencyMs: latencyMs ?? null,
		});

		await db
			.update(instances)
			.set({
				lastSeen: Date.now(),
				updatedAt: Date.now(),
			})
			.where(eq(instances.id, instanceId));
	} catch (error) {
		logError("gRPC failed to record heartbeat", { error, instanceId });
	}
}

export async function upsertSystemInfo(
	instanceId: string,
	systemInfo: {
		supervisor: string;
		homeassistant: string;
		hassos: string;
		docker: string;
		hostname: string;
		operatingSystem: string;
		machine: string;
		arch: string;
		channel: string;
		state: string;
	},
): Promise<void> {
	try {
		const existing = await db
			.select()
			.from(instanceSystemInfo)
			.where(eq(instanceSystemInfo.instanceId, instanceId))
			.limit(1);

		if (existing.length > 0) {
			await db
				.update(instanceSystemInfo)
				.set({
					supervisor: systemInfo.supervisor,
					homeassistant: systemInfo.homeassistant,
					hassos: systemInfo.hassos,
					docker: systemInfo.docker,
					hostname: systemInfo.hostname,
					operatingSystem: systemInfo.operatingSystem,
					machine: systemInfo.machine,
					arch: systemInfo.arch,
					channel: systemInfo.channel,
					state: systemInfo.state,
					updatedAt: Date.now(),
				})
				.where(eq(instanceSystemInfo.instanceId, instanceId));
		} else {
			await db.insert(instanceSystemInfo).values({
				id: randomBytes(16).toString("hex"),
				instanceId,
				supervisor: systemInfo.supervisor,
				homeassistant: systemInfo.homeassistant,
				hassos: systemInfo.hassos,
				docker: systemInfo.docker,
				hostname: systemInfo.hostname,
				operatingSystem: systemInfo.operatingSystem,
				machine: systemInfo.machine,
				arch: systemInfo.arch,
				channel: systemInfo.channel,
				state: systemInfo.state,
				updatedAt: Date.now(),
			});
		}
	} catch (error) {
		logError("gRPC failed to upsert system info", { error, instanceId });
	}
}

export async function updateReportedUpdates(
	instanceId: string,
	report: {
		generatedAtSeconds: number;
		components: Array<{
			componentType: string;
			slug: string;
			name: string;
			version: string;
			versionLatest: string;
			updateAvailable: boolean;
		}>;
	},
): Promise<void> {
	try {
		await db
			.delete(instanceUpdates)
			.where(eq(instanceUpdates.instanceId, instanceId));

		const generatedAtMs =
			report.generatedAtSeconds > 0 ? report.generatedAtSeconds * 1000 : null;
		const availableUpdates = report.components.filter(
			(component) => component.updateAvailable,
		);

		if (availableUpdates.length > 0) {
			await db.insert(instanceUpdates).values(
				availableUpdates.map((update) => ({
					id: randomBytes(16).toString("hex"),
					instanceId,
					updateType: update.componentType,
					slug: update.slug || null,
					name: update.name || null,
					version: update.version || null,
					versionLatest: update.versionLatest || null,
					updateAvailable: update.updateAvailable ? 1 : 0,
					reportGeneratedAt: generatedAtMs,
					icon: null,
					panelPath: null,
					createdAt: Date.now(),
				})),
			);
		}
	} catch (error) {
		logError("gRPC failed to update reported updates", { error, instanceId });
	}
}

export async function recordStatsReport(
	instanceId: string,
	report: {
		generatedAtSeconds: number;
		stats: {
			cpuPercent: number;
			memoryUsage: number;
			memoryLimit: number;
			memoryPercent: number;
			networkTx: number;
			networkRx: number;
			blkRead: number;
			blkWrite: number;
		};
	},
): Promise<void> {
	try {
		const generatedAtMs =
			report.generatedAtSeconds > 0 ? report.generatedAtSeconds * 1000 : null;
		await db.insert(instanceStats).values({
			id: randomBytes(16).toString("hex"),
			instanceId,
			generatedAt: generatedAtMs,
			cpuPercent: report.stats.cpuPercent,
			memoryUsage: report.stats.memoryUsage,
			memoryLimit: report.stats.memoryLimit,
			memoryPercent: report.stats.memoryPercent,
			networkTx: report.stats.networkTx,
			networkRx: report.stats.networkRx,
			blkRead: report.stats.blkRead,
			blkWrite: report.stats.blkWrite,
			createdAt: Date.now(),
		});
	} catch (error) {
		logError("gRPC failed to record stats report", { error, instanceId });
	}
}

export async function recordConnectivityChecks(
	instanceId: string,
	report: {
		publicIp: string | null;
		checks: Array<{
			target: string;
			status: string;
			latencyMs: number | null;
			error: string | null;
		}>;
	},
): Promise<void> {
	try {
		const enrichment = report.publicIp
			? await resolveIpEnrichment(report.publicIp)
			: null;

		if (report.checks.length === 0) {
			return;
		}

		await db.insert(connectivityChecks).values(
			report.checks.map((check) => ({
				id: randomBytes(16).toString("hex"),
				instanceId,
				timestamp: Date.now(),
				target: check.target,
				status: check.status,
				latencyMs: check.latencyMs ?? null,
				error: check.error ?? null,
				publicIp: report.publicIp,
				ipCountry: enrichment?.ipCountry ?? null,
				ipRegion: enrichment?.ipRegion ?? null,
				ipCity: enrichment?.ipCity ?? null,
				ipIsp: enrichment?.ipIsp ?? null,
				ipAsn: enrichment?.ipAsn ?? null,
			})),
		);
	} catch (error) {
		logError("gRPC failed to record connectivity checks", {
			error,
			instanceId,
		});
	}
}
