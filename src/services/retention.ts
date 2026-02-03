import { lt } from "drizzle-orm";
import { db } from "../db";
import {
	connectivityChecks,
	heartbeats,
	instanceStats,
} from "../db/schema";
import { env } from "../config/env";
import { logError, logInfo } from "../lib/logger";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface CleanupResult {
	heartbeatsDeleted: number;
	connectivityChecksDeleted: number;
	statsDeleted: number;
}

/**
 * Deletes old time-series data based on retention settings.
 * Returns the number of rows deleted from each table.
 */
export async function cleanupOldData(): Promise<CleanupResult> {
	const now = Date.now();

	const heartbeatsCutoff =
		now - env.RETENTION_HEARTBEATS_DAYS * MILLISECONDS_PER_DAY;
	const connectivityCutoff =
		now - env.RETENTION_CONNECTIVITY_DAYS * MILLISECONDS_PER_DAY;
	const statsCutoff = now - env.RETENTION_STATS_DAYS * MILLISECONDS_PER_DAY;

	const result: CleanupResult = {
		heartbeatsDeleted: 0,
		connectivityChecksDeleted: 0,
		statsDeleted: 0,
	};

	try {
		// Delete old heartbeats
		const deletedHeartbeats = await db
			.delete(heartbeats)
			.where(lt(heartbeats.timestamp, heartbeatsCutoff))
			.returning({ id: heartbeats.id });
		result.heartbeatsDeleted = deletedHeartbeats.length;

		// Delete old connectivity checks
		const deletedConnectivity = await db
			.delete(connectivityChecks)
			.where(lt(connectivityChecks.timestamp, connectivityCutoff))
			.returning({ id: connectivityChecks.id });
		result.connectivityChecksDeleted = deletedConnectivity.length;

		// Delete old stats
		const deletedStats = await db
			.delete(instanceStats)
			.where(lt(instanceStats.createdAt, statsCutoff))
			.returning({ id: instanceStats.id });
		result.statsDeleted = deletedStats.length;

		logInfo("Data retention cleanup completed", {
			heartbeatsDeleted: result.heartbeatsDeleted,
			connectivityChecksDeleted: result.connectivityChecksDeleted,
			statsDeleted: result.statsDeleted,
			retentionDays: {
				heartbeats: env.RETENTION_HEARTBEATS_DAYS,
				connectivity: env.RETENTION_CONNECTIVITY_DAYS,
				stats: env.RETENTION_STATS_DAYS,
			},
		});
	} catch (error) {
		logError("Data retention cleanup failed", { error });
		throw error;
	}

	return result;
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the periodic cleanup job.
 * Runs immediately on start, then at the configured interval.
 */
export function startRetentionCleanup(): void {
	const intervalMs = env.RETENTION_CLEANUP_INTERVAL_MINUTES * 60 * 1000;

	logInfo("Starting data retention cleanup scheduler", {
		intervalMinutes: env.RETENTION_CLEANUP_INTERVAL_MINUTES,
		retentionDays: {
			heartbeats: env.RETENTION_HEARTBEATS_DAYS,
			connectivity: env.RETENTION_CONNECTIVITY_DAYS,
			stats: env.RETENTION_STATS_DAYS,
		},
	});

	// Run immediately on startup
	cleanupOldData().catch((error) => {
		logError("Initial retention cleanup failed", { error });
	});

	// Schedule periodic cleanup
	cleanupInterval = setInterval(() => {
		cleanupOldData().catch((error) => {
			logError("Scheduled retention cleanup failed", { error });
		});
	}, intervalMs);
}

/**
 * Stops the periodic cleanup job.
 */
export function stopRetentionCleanup(): void {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
		logInfo("Data retention cleanup scheduler stopped");
	}
}
