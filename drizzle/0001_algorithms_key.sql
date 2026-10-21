ALTER TABLE "algorithms" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "algorithms" ADD CONSTRAINT "algorithms_key_unique" UNIQUE("key");--> statement-breakpoint
ALTER TABLE "algorithms" ADD CONSTRAINT "algorithms_key_format" CHECK ("algorithms"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');