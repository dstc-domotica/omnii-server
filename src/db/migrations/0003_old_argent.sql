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
ALTER TABLE "connectivity_checks" ADD CONSTRAINT "connectivity_checks_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;