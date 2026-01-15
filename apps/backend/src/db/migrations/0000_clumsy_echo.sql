CREATE TABLE `enrollment_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`instance_id` text,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`deactivated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollment_codes_code_unique` ON `enrollment_codes` (`code`);--> statement-breakpoint
CREATE TABLE `heartbeats` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`status` text NOT NULL,
	`latency_ms` integer,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `instance_system_info` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`supervisor` text,
	`homeassistant` text,
	`hassos` text,
	`docker` text,
	`hostname` text,
	`operating_system` text,
	`machine` text,
	`arch` text,
	`channel` text,
	`state` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instance_system_info_instance_id_unique` ON `instance_system_info` (`instance_id`);--> statement-breakpoint
CREATE TABLE `instance_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`update_type` text NOT NULL,
	`name` text,
	`icon` text,
	`version_latest` text,
	`panel_path` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `instances` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`enrollment_code` text,
	`enrolled_at` integer,
	`token` text,
	`status` text DEFAULT 'offline' NOT NULL,
	`last_seen` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instances_token_unique` ON `instances` (`token`);