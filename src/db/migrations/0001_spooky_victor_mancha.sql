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
ALTER TABLE "instance_stats" ADD CONSTRAINT "instance_stats_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;