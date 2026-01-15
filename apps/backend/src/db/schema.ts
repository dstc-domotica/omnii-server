import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const instances = sqliteTable("instances", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  enrollmentCode: text("enrollment_code"),
  enrolledAt: integer("enrolled_at"),
  token: text("token").unique(),
  status: text("status").notNull().default("offline"), // online, offline, error
  lastSeen: integer("last_seen"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export const enrollmentCodes = sqliteTable("enrollment_codes", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  instanceId: text("instance_id"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  expiresAt: integer("expires_at").notNull(),
  usedAt: integer("used_at"),
  deactivatedAt: integer("deactivated_at"),
});

export const heartbeats = sqliteTable("heartbeats", {
  id: text("id").primaryKey(),
  instanceId: text("instance_id").notNull().references(() => instances.id),
  timestamp: integer("timestamp").notNull().$defaultFn(() => Date.now()),
  status: text("status").notNull(), // online, offline, error
  latencyMs: integer("latency_ms"), // gRPC round-trip time in milliseconds
});

// System information from Supervisor /info API
export const instanceSystemInfo = sqliteTable("instance_system_info", {
  id: text("id").primaryKey(),
  instanceId: text("instance_id").notNull().references(() => instances.id).unique(),
  supervisor: text("supervisor"),
  homeassistant: text("homeassistant"),
  hassos: text("hassos"),
  docker: text("docker"),
  hostname: text("hostname"),
  operatingSystem: text("operating_system"),
  machine: text("machine"),
  arch: text("arch"),
  channel: text("channel"),  // stable, beta, dev
  state: text("state"),      // running, etc.
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

// Available updates from Supervisor /available_updates API
export const instanceUpdates = sqliteTable("instance_updates", {
  id: text("id").primaryKey(),
  instanceId: text("instance_id").notNull().references(() => instances.id),
  updateType: text("update_type").notNull(),  // core, os, supervisor, addon
  slug: text("slug"),           // Addon slug (if applicable)
  name: text("name"),           // For addons only
  icon: text("icon"),           // For addons only
  version: text("version"),
  versionLatest: text("version_latest"),
  updateAvailable: integer("update_available"),
  reportGeneratedAt: integer("report_generated_at"),
  panelPath: text("panel_path"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

