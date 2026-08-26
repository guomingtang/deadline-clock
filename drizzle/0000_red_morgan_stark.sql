CREATE TABLE `conferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`field` text NOT NULL,
	`deadline` text,
	`abstract_deadline` text,
	`timezone` text,
	`source_name` text,
	`source_url` text,
	`deadline_status` text DEFAULT 'pending' NOT NULL,
	`manually_overridden` integer DEFAULT false NOT NULL,
	`last_checked_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
