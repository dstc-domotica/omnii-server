import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const instances = sqliteTable("instances", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  enrollmentCode: text("enrollment_code"),
  enrolledAt: integer("enrolled_at"),
  mqttClientId: text("mqtt_client_id").notNull(),
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
});

export const metrics = sqliteTable("metrics", {
  id: text("id").primaryKey(),
  instanceId: text("instance_id").notNull().references(() => instances.id),
  timestamp: integer("timestamp").notNull().$defaultFn(() => Date.now()),
  uptimeSeconds: integer("uptime_seconds"),
  version: text("version"),
  stabilityScore: real("stability_score"),
  metadata: text("metadata"), // JSON string
});

export const heartbeats = sqliteTable("heartbeats", {
  id: text("id").primaryKey(),
  instanceId: text("instance_id").notNull().references(() => instances.id),
  timestamp: integer("timestamp").notNull().$defaultFn(() => Date.now()),
  status: text("status").notNull(), // online, offline, error
});

