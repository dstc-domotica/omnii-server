import { and, desc, eq, gte, isNull, or } from "drizzle-orm";
import {
	db,
	heartbeats,
	instanceSystemInfo,
	instances,
	instanceUpdates,
} from "../db";
import { isAddonConnected, requestUpdateFromAddon } from "../grpc/server";
import { ApiError } from "../http/errors";
import type {
	HeartbeatModel,
	InstanceModel,
	InstanceSystemInfoModel,
	InstanceUpdateModel,
} from "../types/models";

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
	await db.delete(heartbeats).where(eq(heartbeats.instanceId, instanceId));
	await db.delete(instances).where(eq(instances.id, instanceId));
}
