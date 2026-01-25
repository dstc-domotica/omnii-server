import {
	bigint,
	doublePrecision,
	integer,
	pgTable,
	text,
} from "drizzle-orm/pg-core";

export const instances = pgTable("instances", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	enrollmentCode: text("enrollment_code"),
	enrolledAt: bigint("enrolled_at", { mode: "number" }),
	token: text("token").unique(),
	status: text("status").notNull().default("offline"), // online, offline, error
	lastSeen: bigint("last_seen", { mode: "number" }),
	createdAt: bigint("created_at", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: bigint("updated_at", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
});

export const enrollmentCodes = pgTable("enrollment_codes", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	instanceId: text("instance_id"),
	createdAt: bigint("created_at", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
	expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
	usedAt: bigint("used_at", { mode: "number" }),
	deactivatedAt: bigint("deactivated_at", { mode: "number" }),
});

export const heartbeats = pgTable("heartbeats", {
	id: text("id").primaryKey(),
	instanceId: text("instance_id")
		.notNull()
		.references(() => instances.id),
	timestamp: bigint("timestamp", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
	status: text("status").notNull(), // online, offline, error
	latencyMs: integer("latency_ms"), // gRPC round-trip time in milliseconds
});

// System information from Supervisor /info API
export const instanceSystemInfo = pgTable("instance_system_info", {
	id: text("id").primaryKey(),
	instanceId: text("instance_id")
		.notNull()
		.references(() => instances.id)
		.unique(),
	supervisor: text("supervisor"),
	homeassistant: text("homeassistant"),
	hassos: text("hassos"),
	docker: text("docker"),
	hostname: text("hostname"),
	operatingSystem: text("operating_system"),
	machine: text("machine"),
	arch: text("arch"),
	channel: text("channel"), // stable, beta, dev
	state: text("state"), // running, etc.
	updatedAt: bigint("updated_at", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
});

// Available updates from Supervisor /available_updates API
export const instanceUpdates = pgTable("instance_updates", {
	id: text("id").primaryKey(),
	instanceId: text("instance_id")
		.notNull()
		.references(() => instances.id),
	updateType: text("update_type").notNull(), // core, os, supervisor, addon
	slug: text("slug"), // Addon slug (if applicable)
	name: text("name"), // For addons only
	icon: text("icon"), // For addons only
	version: text("version"),
	versionLatest: text("version_latest"),
	updateAvailable: integer("update_available"),
	reportGeneratedAt: bigint("report_generated_at", { mode: "number" }),
	panelPath: text("panel_path"),
	createdAt: bigint("created_at", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
});

// Instance core stats reports (time series)
export const instanceStats = pgTable("instance_stats", {
	id: text("id").primaryKey(),
	instanceId: text("instance_id")
		.notNull()
		.references(() => instances.id),
	generatedAt: bigint("generated_at", { mode: "number" }),
	cpuPercent: doublePrecision("cpu_percent"),
	memoryUsage: bigint("memory_usage", { mode: "number" }),
	memoryLimit: bigint("memory_limit", { mode: "number" }),
	memoryPercent: doublePrecision("memory_percent"),
	networkTx: bigint("network_tx", { mode: "number" }),
	networkRx: bigint("network_rx", { mode: "number" }),
	blkRead: bigint("blk_read", { mode: "number" }),
	blkWrite: bigint("blk_write", { mode: "number" }),
	createdAt: bigint("created_at", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
});

export const instanceRefreshTokens = pgTable("instance_refresh_tokens", {
	id: text("id").primaryKey(),
	instanceId: text("instance_id")
		.notNull()
		.references(() => instances.id),
	tokenHash: text("token_hash").notNull().unique(),
	createdAt: bigint("created_at", { mode: "number" })
		.notNull()
		.$defaultFn(() => Date.now()),
	lastUsedAt: bigint("last_used_at", { mode: "number" }),
	expiresAt: bigint("expires_at", { mode: "number" }),
	revokedAt: bigint("revoked_at", { mode: "number" }),
});
