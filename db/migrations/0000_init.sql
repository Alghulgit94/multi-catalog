CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_path` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_store_id_slug_unique` ON `categories` (`store_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_id_store_id_unique` ON `categories` (`id`,`store_id`);--> statement-breakpoint
CREATE TABLE `onboarding_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`logo_public_id` text,
	`expires_at` text NOT NULL,
	`claimed_at` text,
	`claimed_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `onboarding_drafts_expires_idx` ON `onboarding_drafts` (`expires_at`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`product_id` text NOT NULL,
	`public_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_cover` integer DEFAULT false NOT NULL,
	`is_ai_generated` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`,`store_id`) REFERENCES `products`(`id`,`store_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_images_one_cover` ON `product_images` (`product_id`) WHERE "product_images"."is_cover" = 1;--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`category_id` text NOT NULL,
	`subcategory_id` text,
	`sku` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`short_description` text,
	`description` text,
	`price` real,
	`show_price` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`,`store_id`) REFERENCES `categories`(`id`,`store_id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `products_store_idx` ON `products` (`store_id`,`is_active`,`is_visible`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_store_id_slug_unique` ON `products` (`store_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_id_store_id_unique` ON `products` (`id`,`store_id`);--> statement-breakpoint
CREATE TABLE `review_history` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`admin_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`admin_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "review_history_action_check" CHECK("review_history"."action" in ('approved', 'changes_requested', 'suspended', 'reactivated'))
);
--> statement-breakpoint
CREATE INDEX `review_history_store_idx` ON `review_history` (`store_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `store_members` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'owner' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "store_members_role_check" CHECK("store_members"."role" in ('owner', 'editor'))
);
--> statement-breakpoint
CREATE INDEX `store_members_user_idx` ON `store_members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_members_store_id_user_id_unique` ON `store_members` (`store_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'active_unverified' NOT NULL,
	`logo_path` text,
	`primary_color` text,
	`banner_path` text,
	`hero_eyebrow` text,
	`hero_title` text,
	`hero_subtitle` text,
	`shipping_note` text,
	`tagline` text,
	`whatsapp` text,
	`email` text,
	`address` text,
	`city` text,
	`currency` text DEFAULT 'PYG' NOT NULL,
	`locale` text DEFAULT 'es-PY' NOT NULL,
	`plan_id` text,
	`plan_intent` text,
	`terms_accepted_at` text,
	`verification_deadline` text,
	`verified_at` text,
	`review_message` text,
	`reminder_day3_sent_at` text,
	`reminder_day6_sent_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT "stores_slug_len" CHECK(length("stores"."slug") between 3 and 30),
	CONSTRAINT "stores_status_check" CHECK("stores"."status" in ('active_unverified', 'in_review', 'verified', 'paused', 'suspended'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_slug_unique` ON `stores` (`slug`);--> statement-breakpoint
CREATE INDEX `stores_status_idx` ON `stores` (`status`);--> statement-breakpoint
CREATE TABLE `subcategories` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`,`store_id`) REFERENCES `categories`(`id`,`store_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subcategories_store_id_slug_unique` ON `subcategories` (`store_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `subcategories_id_store_id_unique` ON `subcategories` (`id`,`store_id`);--> statement-breakpoint
CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`is_superadmin` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
INSERT INTO `system_settings` (`key`, `value`) VALUES ('verification_days', '7'), ('review_mode', '"manual"');
