CREATE TABLE "algorithms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "algorithms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"time_complexity" text,
	"space_complexity" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "algorithms_name_unique" UNIQUE("name"),
	CONSTRAINT "algorithms_slug_unique" UNIQUE("slug"),
	CONSTRAINT "algorithms_slug_format" CHECK ("algorithms"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "categories_slug_format" CHECK ("categories"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "runs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"algorithm_id" integer NOT NULL,
	"input" jsonb NOT NULL,
	"input_size" integer NOT NULL,
	"step_count" integer,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "runs_input_size_non_negative" CHECK ("runs"."input_size" >= 0)
);
--> statement-breakpoint
ALTER TABLE "algorithms" ADD CONSTRAINT "algorithms_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_algorithm_id_algorithms_id_fk" FOREIGN KEY ("algorithm_id") REFERENCES "public"."algorithms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "algorithms_category_id_idx" ON "algorithms" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "runs_algorithm_id_idx" ON "runs" USING btree ("algorithm_id");