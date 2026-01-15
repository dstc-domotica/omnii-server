import { lt } from "drizzle-orm";
import { db, heartbeats } from "../db";

async function cleanupOldHeartbeats(): Promise<void> {
	try {
		const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
		await db.delete(heartbeats).where(lt(heartbeats.timestamp, cutoffTime));
		console.log(
			`[Cleanup] Deleted old heartbeats (before ${new Date(cutoffTime).toISOString()})`,
		);
	} catch (error) {
		console.error("[Cleanup] Failed to delete old heartbeats:", error);
	}
}

export function startCleanupJob(): void {
	setInterval(cleanupOldHeartbeats, 60 * 60 * 1000);
	setTimeout(cleanupOldHeartbeats, 5000);
}
