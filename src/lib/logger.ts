type LogLevel = "info" | "warn" | "error";

function serializeError(error: unknown): Record<string, unknown> | undefined {
	if (!(error instanceof Error)) {
		return undefined;
	}
	return {
		name: error.name,
		message: error.message,
		stack: error.stack,
	};
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
	const payload = {
		level,
		message,
		timestamp: new Date().toISOString(),
		...meta,
		error: meta?.error ? meta.error : undefined,
	};
	const output = JSON.stringify(payload);
	if (level === "error") {
		console.error(output);
		return;
	}
	console.log(output);
}

export function logInfo(message: string, meta?: Record<string, unknown>): void {
	log("info", message, meta);
}

export function logWarn(message: string, meta?: Record<string, unknown>): void {
	log("warn", message, meta);
}

export function logError(
	message: string,
	meta?: Record<string, unknown>,
): void {
	const normalizedMeta = meta
		? { ...meta, error: serializeError(meta.error) ?? meta.error }
		: undefined;
	log("error", message, normalizedMeta);
}
