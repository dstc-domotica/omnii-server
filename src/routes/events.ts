import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { eventBus, type InstanceEvent } from "../lib/event-bus";
import { logInfo } from "../lib/logger";

const app = new Hono();

/**
 * SSE endpoint for subscribing to all instance events.
 * GET /events/instances
 *
 * Events are sent in the format:
 * event: instance:status
 * data: {"instanceId":"...","timestamp":...,"data":{...}}
 */
app.get("/events/instances", (c) => {
	return streamSSE(c, async (stream) => {
		const clientId = crypto.randomUUID().slice(0, 8);
		logInfo("SSE client connected (all instances)", { clientId });

		let isConnected = true;

		const handleEvent = (event: InstanceEvent) => {
			if (!isConnected) return;
			stream
				.writeSSE({
					event: event.type,
					data: JSON.stringify({
						instanceId: event.instanceId,
						timestamp: event.timestamp,
						data: event.data,
					}),
				})
				.catch(() => {
					isConnected = false;
				});
		};

		const unsubscribe = eventBus.subscribeToAll(handleEvent);

		// Send initial connection event
		await stream.writeSSE({
			event: "connected",
			data: JSON.stringify({ clientId, timestamp: Date.now() }),
		});

		// Keep connection alive with periodic heartbeat
		const heartbeatInterval = setInterval(() => {
			if (!isConnected) {
				clearInterval(heartbeatInterval);
				return;
			}
			stream
				.writeSSE({
					event: "heartbeat",
					data: JSON.stringify({ timestamp: Date.now() }),
				})
				.catch(() => {
					isConnected = false;
					clearInterval(heartbeatInterval);
				});
		}, 30000); // 30 second heartbeat

		// Wait until connection closes
		try {
			await stream.sleep(Number.MAX_SAFE_INTEGER);
		} catch {
			// Connection closed
		} finally {
			isConnected = false;
			clearInterval(heartbeatInterval);
			unsubscribe();
			logInfo("SSE client disconnected (all instances)", { clientId });
		}
	});
});

/**
 * SSE endpoint for subscribing to events for a specific instance.
 * GET /events/instances/:id
 *
 * Events are sent in the format:
 * event: instance:status
 * data: {"instanceId":"...","timestamp":...,"data":{...}}
 */
app.get("/events/instances/:id", (c) => {
	const instanceId = c.req.param("id");

	return streamSSE(c, async (stream) => {
		const clientId = crypto.randomUUID().slice(0, 8);
		logInfo("SSE client connected (single instance)", { clientId, instanceId });

		let isConnected = true;

		const handleEvent = (event: InstanceEvent) => {
			if (!isConnected) return;
			stream
				.writeSSE({
					event: event.type,
					data: JSON.stringify({
						instanceId: event.instanceId,
						timestamp: event.timestamp,
						data: event.data,
					}),
				})
				.catch(() => {
					isConnected = false;
				});
		};

		const unsubscribe = eventBus.subscribeToInstance(instanceId, handleEvent);

		// Send initial connection event
		await stream.writeSSE({
			event: "connected",
			data: JSON.stringify({ clientId, instanceId, timestamp: Date.now() }),
		});

		// Keep connection alive with periodic heartbeat
		const heartbeatInterval = setInterval(() => {
			if (!isConnected) {
				clearInterval(heartbeatInterval);
				return;
			}
			stream
				.writeSSE({
					event: "heartbeat",
					data: JSON.stringify({ timestamp: Date.now() }),
				})
				.catch(() => {
					isConnected = false;
					clearInterval(heartbeatInterval);
				});
		}, 30000); // 30 second heartbeat

		// Wait until connection closes
		try {
			await stream.sleep(Number.MAX_SAFE_INTEGER);
		} catch {
			// Connection closed
		} finally {
			isConnected = false;
			clearInterval(heartbeatInterval);
			unsubscribe();
			logInfo("SSE client disconnected (single instance)", {
				clientId,
				instanceId,
			});
		}
	});
});

export default app;
