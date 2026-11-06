ALTER TABLE "algorithm_code_snippets" RENAME TO "algorithm_source_codes";--> statement-breakpoint
ALTER SEQUENCE "algorithm_code_snippets_id_seq" RENAME TO "algorithm_source_codes_id_seq";--> statement-breakpoint
ALTER TABLE "algorithm_source_codes" RENAME CONSTRAINT "algorithm_code_snippets_pkey" TO "algorithm_source_codes_pkey";--> statement-breakpoint
ALTER TABLE "algorithm_source_codes" RENAME CONSTRAINT "algorithm_code_snippets_algorithm_kind_language_unique" TO "algorithm_source_codes_algorithm_kind_language_unique";--> statement-breakpoint
ALTER TABLE "algorithm_source_codes" RENAME CONSTRAINT "algorithm_code_snippets_kind_valid" TO "algorithm_source_codes_kind_valid";--> statement-breakpoint
ALTER TABLE "algorithm_source_codes" RENAME CONSTRAINT "algorithm_code_snippets_language_matches_kind" TO "algorithm_source_codes_language_matches_kind";--> statement-breakpoint
ALTER TABLE "algorithm_source_codes" RENAME CONSTRAINT "algorithm_code_snippets_algorithm_id_algorithms_id_fk" TO "algorithm_source_codes_algorithm_id_algorithms_id_fk";
