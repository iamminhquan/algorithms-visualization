import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";

export const categoriesTable = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    check(
      "categories_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`,
    ),
  ],
);

export const algorithmsTable = pgTable(
  "algorithms",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "restrict" }),
    key: text("key").notNull().unique(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    timeComplexity: text("time_complexity"),
    spaceComplexity: text("space_complexity"),
    ...timestamps,
  },
  (table) => [
    index("algorithms_category_id_idx").on(table.categoryId),
    check(
      "algorithms_key_format",
      sql`${table.key} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`,
    ),
    check(
      "algorithms_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`,
    ),
  ],
);

export const runsTable = pgTable(
  "runs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    algorithmId: integer("algorithm_id")
      .notNull()
      .references(() => algorithmsTable.id, { onDelete: "cascade" }),
    input: jsonb("input").$type<number[]>().notNull(),
    inputSize: integer("input_size").notNull(),
    stepCount: integer("step_count"),
    durationMs: integer("duration_ms"),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    index("runs_algorithm_id_idx").on(table.algorithmId),
    check("runs_input_size_non_negative", sql`${table.inputSize} >= 0`),
  ],
);

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type Algorithm = typeof algorithmsTable.$inferSelect;
export type NewAlgorithm = typeof algorithmsTable.$inferInsert;
export type Run = typeof runsTable.$inferSelect;
export type NewRun = typeof runsTable.$inferInsert;
