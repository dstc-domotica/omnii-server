type MetricName =
	| "auth_success"
	| "auth_failure"
	| "auth_rate_limited"
	| "refresh_success"
	| "refresh_failure";

const counters = new Map<MetricName, number>();

export function incrementMetric(name: MetricName, count = 1): void {
	const current = counters.get(name) ?? 0;
	counters.set(name, current + count);
}

export function getMetricsSnapshot(): Record<string, number> {
	return Object.fromEntries(counters.entries());
}
