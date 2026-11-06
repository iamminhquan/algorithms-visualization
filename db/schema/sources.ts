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

export const algorithmSourceCodesTable = pgTable(
  "algorithm_source_codes",
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
    unique("algorithm_source_codes_algorithm_kind_language_unique").on(
      table.algorithmId,
      table.kind,
      table.language,
    ),
    check(
      "algorithm_source_codes_kind_valid",
      sql`${table.kind} in ('pseudocode', 'source')`,
    ),
    check(
      "algorithm_source_codes_language_matches_kind",
      sql`(${table.kind} = 'pseudocode' and ${table.language} = '') or (${table.kind} = 'source' and ${table.language} <> '')`,
    ),
  ],
);

export type AlgorithmSourceCode = typeof algorithmSourceCodesTable.$inferSelect;
export type NewAlgorithmSourceCode =
  typeof algorithmSourceCodesTable.$inferInsert;
