CREATE TABLE `cert_target` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`issuer` text DEFAULT '' NOT NULL,
	`exam_date` text,
	`progress_mode` text DEFAULT 'auto' NOT NULL,
	`manual_progress` integer,
	`study_tags` text DEFAULT '[]' NOT NULL,
	`target_hours` real,
	`current_focus` text DEFAULT '' NOT NULL,
	`is_now_studying` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `certification` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`issuer` text DEFAULT '' NOT NULL,
	`earned_on` text,
	`expires_on` text,
	`badge_url` text,
	`credential_url` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`mail_status` text DEFAULT 'pending' NOT NULL,
	`mail_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_message_status_idx` ON `contact_message` (`status`);--> statement-breakpoint
CREATE TABLE `goal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`period` text NOT NULL,
	`label` text NOT NULL,
	`target` real NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`manual_value` real,
	`note` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learning_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`report_text` text DEFAULT '' NOT NULL,
	`report_ai_polished` integer DEFAULT false NOT NULL,
	`note_md` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_entry_date_uq` ON `learning_entry` (`date`);--> statement-breakpoint
CREATE INDEX `learning_entry_status_idx` ON `learning_entry` (`status`);--> statement-breakpoint
CREATE TABLE `learning_session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`tag` text NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`minutes` integer NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `learning_entry`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_session_entry_idx` ON `learning_session` (`entry_id`);--> statement-breakpoint
CREATE TABLE `post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`body_md` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_kind_slug_uq` ON `post` (`kind`,`slug`);--> statement-breakpoint
CREATE TABLE `rate_limit` (
	`key` text NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`key`, `window_start`)
);
--> statement-breakpoint
CREATE TABLE `review_comment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`persona` text NOT NULL,
	`tag` text NOT NULL,
	`title` text NOT NULL,
	`text` text NOT NULL,
	`evidence` text DEFAULT '[]' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`generated_at` text NOT NULL,
	`published_at` text,
	`batch_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `review_comment_persona_idx` ON `review_comment` (`persona`,`published`);--> statement-breakpoint
CREATE TABLE `site_setting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skill` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`years` real,
	`description` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
