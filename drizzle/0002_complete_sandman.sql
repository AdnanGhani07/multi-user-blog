CREATE TABLE "anonymous_read_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"anonymous_user_id" text NOT NULL,
	"post_id" integer NOT NULL,
	"total_time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "anonymous_read_progress" ADD CONSTRAINT "anonymous_read_progress_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "anonymous_user_post_unique" ON "anonymous_read_progress" USING btree ("anonymous_user_id","post_id");