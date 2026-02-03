CREATE TABLE "connectivity_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"timestamp" bigint NOT NULL,
	"target" text NOT NULL,
	"status" text NOT NULL,
	"latency_ms" integer,
	"error" text,
	"public_ip" text,
	"ip_country" text,
	"ip_region" text,
	"ip_city" text,
	"ip_isp" text,
	"ip_asn" text
);
--> statement-breakpoint
CREATE TABLE "enrollment_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"instance_id" text,
	"created_at" bigint NOT NULL,
	"expires_at" bigint NOT NULL,
	"used_at" bigint,
	"deactivated_at" bigint,
	CONSTRAINT "enrollment_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "heartbeats" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"timestamp" bigint NOT NULL,
	"status" text NOT NULL,
	"latency_ms" integer
);
--> statement-breakpoint
CREATE TABLE "instance_refresh_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" bigint NOT NULL,
	"last_used_at" bigint,
	"expires_at" bigint,
	"revoked_at" bigint,
	CONSTRAINT "instance_refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "instance_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"generated_at" bigint,
	"cpu_percent" double precision,
	"memory_usage" bigint,
	"memory_limit" bigint,
	"memory_percent" double precision,
	"network_tx" bigint,
	"network_rx" bigint,
	"blk_read" bigint,
	"blk_write" bigint,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instance_system_info" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"supervisor" text,
	"homeassistant" text,
	"hassos" text,
	"docker" text,
	"hostname" text,
	"operating_system" text,
	"machine" text,
	"arch" text,
	"channel" text,
	"state" text,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "instance_system_info_instance_id_unique" UNIQUE("instance_id")
);
--> statement-breakpoint
CREATE TABLE "instance_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"update_type" text NOT NULL,
	"slug" text,
	"name" text,
	"icon" text,
	"version" text,
	"version_latest" text,
	"update_available" integer,
	"report_generated_at" bigint,
	"panel_path" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instances" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"enrollment_code" text,
	"enrolled_at" bigint,
	"token" text,
	"status" text DEFAULT 'offline' NOT NULL,
	"last_seen" bigint,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "instances_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "connectivity_checks" ADD CONSTRAINT "connectivity_checks_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "heartbeats" ADD CONSTRAINT "heartbeats_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_refresh_tokens" ADD CONSTRAINT "instance_refresh_tokens_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_stats" ADD CONSTRAINT "instance_stats_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_system_info" ADD CONSTRAINT "instance_system_info_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_updates" ADD CONSTRAINT "instance_updates_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_connectivity_instance_time" ON "connectivity_checks" USING btree ("instance_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_heartbeats_instance_time" ON "heartbeats" USING btree ("instance_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_stats_instance_time" ON "instance_stats" USING btree ("instance_id","generated_at");