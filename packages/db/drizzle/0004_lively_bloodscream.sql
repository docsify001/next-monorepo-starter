ALTER TABLE "users" ALTER COLUMN "phone_number_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "app_id" text;