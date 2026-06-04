ALTER TABLE "ChallengeOptions" RENAME TO "Challenge_options";--> statement-breakpoint
ALTER TABLE "challengeProgress" RENAME TO "challenge_progress";--> statement-breakpoint
ALTER TABLE "Challenge_options" DROP CONSTRAINT "ChallengeOptions_challenge_id_lessons_id_fk";
--> statement-breakpoint
ALTER TABLE "challenge_progress" DROP CONSTRAINT "challengeProgress_challenge_id_lessons_id_fk";
--> statement-breakpoint
ALTER TABLE "Challenge_options" ADD CONSTRAINT "Challenge_options_challenge_id_lessons_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_progress" ADD CONSTRAINT "challenge_progress_challenge_id_lessons_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;