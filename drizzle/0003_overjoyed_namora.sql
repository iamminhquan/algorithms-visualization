CREATE TABLE "algorithm_code_snippets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "algorithm_code_snippets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"algorithm_id" integer NOT NULL,
	"kind" text NOT NULL,
	"language" text DEFAULT '' NOT NULL,
	"lines" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "algorithm_code_snippets_algorithm_kind_language_unique" UNIQUE("algorithm_id","kind","language"),
	CONSTRAINT "algorithm_code_snippets_kind_valid" CHECK ("algorithm_code_snippets"."kind" in ('pseudocode', 'source')),
	CONSTRAINT "algorithm_code_snippets_language_matches_kind" CHECK (("algorithm_code_snippets"."kind" = 'pseudocode' and "algorithm_code_snippets"."language" = '') or ("algorithm_code_snippets"."kind" = 'source' and "algorithm_code_snippets"."language" <> ''))
);
--> statement-breakpoint
ALTER TABLE "algorithm_code_snippets" ADD CONSTRAINT "algorithm_code_snippets_algorithm_id_algorithms_id_fk" FOREIGN KEY ("algorithm_id") REFERENCES "public"."algorithms"("id") ON DELETE cascade ON UPDATE no action;