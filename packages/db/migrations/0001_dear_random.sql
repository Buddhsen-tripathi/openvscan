CREATE TABLE `github_installation` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`installation_id` text NOT NULL,
	`account_login` text NOT NULL,
	`account_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `github_installation_installation_id_unique` ON `github_installation` (`installation_id`);--> statement-breakpoint
CREATE TABLE `repository` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`installation_id` text NOT NULL,
	`github_repo_id` text NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`full_name` text NOT NULL,
	`default_branch` text DEFAULT 'main' NOT NULL,
	`private` integer DEFAULT false NOT NULL,
	`scan_mode` text DEFAULT 'manual' NOT NULL,
	`branch_filter` text,
	`enabled_scanners` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`installation_id`) REFERENCES `github_installation`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scan` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`repository_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`config` text NOT NULL,
	`trigger` text DEFAULT 'manual' NOT NULL,
	`branch` text,
	`commit_sha` text,
	`pr_number` integer,
	`comment_posted` integer DEFAULT false NOT NULL,
	`cancel_requested` integer DEFAULT false NOT NULL,
	`artifact_key` text,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`repository_id`) REFERENCES `repository`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_scan`("id", "project_id", "status", "config", "cancel_requested", "artifact_key", "started_at", "completed_at", "created_at", "updated_at") SELECT "id", "project_id", "status", "config", "cancel_requested", "artifact_key", "started_at", "completed_at", "created_at", "updated_at" FROM `scan`;--> statement-breakpoint
DROP TABLE `scan`;--> statement-breakpoint
ALTER TABLE `__new_scan` RENAME TO `scan`;--> statement-breakpoint
PRAGMA foreign_keys=ON;