/**
 * Simple in-memory event bus for broadcasting instance events to connected clients.
 * Used for Server-Sent Events (SSE) to push real-time updates to the dashboard.
 */

export type InstanceEventType =
	| "instance:status"
	| "instance:heartbeat"
	| "instance:update_available";

export interface InstanceEvent {
	type: InstanceEventType;
	instanceId: string;
	timestamp: number;
	data: Record<string, unknown>;
}

type EventCallback = (event: InstanceEvent) => void;

class EventBus {
	private subscribers = new Map<string, Set<EventCallback>>();
	private allSubscribers = new Set<EventCallback>();

	/**
	 * Subscribe to events for a specific instance.
	 * @returns Unsubscribe function
	 */
	subscribeToInstance(instanceId: string, callback: EventCallback): () => void {
		let subs = this.subscribers.get(instanceId);
		if (!subs) {
			subs = new Set();
			this.subscribers.set(instanceId, subs);
		}
		subs.add(callback);

		return () => {
			const instanceSubs = this.subscribers.get(instanceId);
			if (instanceSubs) {
				instanceSubs.delete(callback);
				if (instanceSubs.size === 0) {
					this.subscribers.delete(instanceId);
				}
			}
		};
	}

	/**
	 * Subscribe to all instance events.
	 * @returns Unsubscribe function
	 */
	subscribeToAll(callback: EventCallback): () => void {
		this.allSubscribers.add(callback);
		return () => {
			this.allSubscribers.delete(callback);
		};
	}

	/**
	 * Emit an event to all relevant subscribers.
	 */
	emit(event: InstanceEvent): void {
		// Notify instance-specific subscribers
		const instanceSubs = this.subscribers.get(event.instanceId);
		if (instanceSubs) {
			for (const callback of instanceSubs) {
				try {
					callback(event);
				} catch {
					// Ignore callback errors
				}
			}
		}

		// Notify global subscribers
		for (const callback of this.allSubscribers) {
			try {
				callback(event);
			} catch {
				// Ignore callback errors
			}
		}
	}

	/**
	 * Get the count of active subscribers (for monitoring).
	 */
	getSubscriberCount(): { instances: number; global: number } {
		let instanceCount = 0;
		for (const subs of this.subscribers.values()) {
			instanceCount += subs.size;
		}
		return {
			instances: instanceCount,
			global: this.allSubscribers.size,
		};
	}
}

// Singleton instance
export const eventBus = new EventBus();

// Helper functions for emitting specific event types
export function emitInstanceStatusChange(
	instanceId: string,
	status: string,
	previousStatus?: string,
): void {
	eventBus.emit({
		type: "instance:status",
		instanceId,
		timestamp: Date.now(),
		data: { status, previousStatus },
	});
}

export function emitInstanceHeartbeat(
	instanceId: string,
	latencyMs?: number,
): void {
	eventBus.emit({
		type: "instance:heartbeat",
		instanceId,
		timestamp: Date.now(),
		data: { latencyMs },
	});
}

export function emitUpdateAvailable(
	instanceId: string,
	updateType: string,
	version: string,
	versionLatest: string,
): void {
	eventBus.emit({
		type: "instance:update_available",
		instanceId,
		timestamp: Date.now(),
		data: { updateType, version, versionLatest },
	});
}
