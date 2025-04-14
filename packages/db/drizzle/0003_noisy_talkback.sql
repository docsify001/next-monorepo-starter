CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"start" varchar(256),
	"prefix" varchar(256),
	"key" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"refill_interval" numeric,
	"refill_amount" numeric,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_time_window" numeric NOT NULL,
	"rate_limit_max" numeric NOT NULL,
	"request_count" numeric NOT NULL,
	"remaining" numeric NOT NULL,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "impersonated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_expires" timestamp;