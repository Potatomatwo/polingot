ALTER TABLE "user_progress" ALTER COLUMN "hearts" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;