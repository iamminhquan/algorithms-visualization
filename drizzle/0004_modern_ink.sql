CREATE TABLE "algorithm_complexities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "algorithm_complexities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"algorithm_id" integer NOT NULL,
	"best_time" text NOT NULL,
	"average_time" text NOT NULL,
	"worst_time" text NOT NULL,
	"space" text NOT NULL,
	"is_stable" boolean,
	"requires_sorted" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "algorithm_complexities_algorithm_id_unique" UNIQUE("algorithm_id")
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE "algorithm_complexities" ADD CONSTRAINT "algorithm_complexities_algorithm_id_algorithms_id_fk" FOREIGN KEY ("algorithm_id") REFERENCES "public"."algorithms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_valid" CHECK ("users"."role" in ('admin', 'teacher', 'student'));