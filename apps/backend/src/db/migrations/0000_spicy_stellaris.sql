CREATE TABLE `enrollment_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`instance_id` text,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollment_codes_code_unique` ON `enrollment_codes` (`code`);--> statement-breakpoint
CREATE TABLE `heartbeats` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `instances` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`enrollment_code` text,
	`enrolled_at` integer,
	`mqtt_client_id` text NOT NULL,
	`status` text DEFAULT 'offline' NOT NULL,
	`last_seen` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`uptime_seconds` integer,
	`version` text,
	`stability_score` real,
	`metadata` text,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE no action
);
