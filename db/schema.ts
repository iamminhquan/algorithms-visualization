import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const categoriesTable = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull().unique(), // ví dụ: "Sắp xếp"
    slug: text("slug").notNull().unique(), // ví dụ: "sap-xep"
    description: text("description"),
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
    name: text("name").notNull().unique(), // ví dụ: "Sắp xếp nổi bọt"
    slug: text("slug").notNull().unique(), // ví dụ: "sap-xep-noi-bot"
    description: text("description"),
    timeComplexity: text("time_complexity"), // ví dụ: "O(n²)"
    spaceComplexity: text("space_complexity"), // ví dụ: "O(1)"
    ...timestamps,
  },
  (table) => [
    index("algorithms_category_id_idx").on(table.categoryId),
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
    input: jsonb("input").$type<number[]>().notNull(), // dữ liệu đầu vào, ví dụ: [5, 3, 8, 1]
    inputSize: integer("input_size").notNull(),
    stepCount: integer("step_count"), // số bước mô phỏng
    durationMs: integer("duration_ms"),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    index("runs_algorithm_id_idx").on(table.algorithmId),
    check("runs_input_size_non_negative", sql`${table.inputSize} >= 0`),
  ],
);

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  algorithms: many(algorithmsTable),
}));

export const algorithmsRelations = relations(
  algorithmsTable,
  ({ one, many }) => ({
    category: one(categoriesTable, {
      fields: [algorithmsTable.categoryId],
      references: [categoriesTable.id],
    }),
    runs: many(runsTable),
  }),
);

export const runsRelations = relations(runsTable, ({ one }) => ({
  algorithm: one(algorithmsTable, {
    fields: [runsTable.algorithmId],
    references: [algorithmsTable.id],
  }),
}));

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type Algorithm = typeof algorithmsTable.$inferSelect;
export type NewAlgorithm = typeof algorithmsTable.$inferInsert;
export type Run = typeof runsTable.$inferSelect;
export type NewRun = typeof runsTable.$inferInsert;
