import { sql } from "drizzle-orm";
import {
  check,
  integer,
  jsonb,
  pgTable,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { algorithmsTable } from "./algorithms";
import { timestamps } from "./columns";

export const CODE_SNIPPET_KINDS = ["pseudocode", "source"] as const;

export type CodeSnippetKind = (typeof CODE_SNIPPET_KINDS)[number];

export const algorithmCodeSnippetsTable = pgTable(
  "algorithm_code_snippets",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    algorithmId: integer("algorithm_id")
      .notNull()
      .references(() => algorithmsTable.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().$type<CodeSnippetKind>(),
    language: text("language").notNull().default(""),
    lines: jsonb("lines").$type<string[]>().notNull(),
    ...timestamps,
  },
  (table) => [
    unique("algorithm_code_snippets_algorithm_kind_language_unique").on(
      table.algorithmId,
      table.kind,
      table.language,
    ),
    check(
      "algorithm_code_snippets_kind_valid",
      sql`${table.kind} in ('pseudocode', 'source')`,
    ),
    check(
      "algorithm_code_snippets_language_matches_kind",
      sql`(${table.kind} = 'pseudocode' and ${table.language} = '') or (${table.kind} = 'source' and ${table.language} <> '')`,
    ),
  ],
);

export type AlgorithmCodeSnippet =
  typeof algorithmCodeSnippetsTable.$inferSelect;
export type NewAlgorithmCodeSnippet =
  typeof algorithmCodeSnippetsTable.$inferInsert;
