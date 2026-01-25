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
ALTER TABLE "instance_refresh_tokens" ADD CONSTRAINT "instance_refresh_tokens_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE no action ON UPDATE no action;