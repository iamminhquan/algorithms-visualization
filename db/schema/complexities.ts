import { boolean, integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { algorithmsTable } from "./algorithms";
import { timestamps } from "./columns";

export const algorithmComplexitiesTable = pgTable(
  "algorithm_complexities",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    algorithmId: integer("algorithm_id")
      .notNull()
      .references(() => algorithmsTable.id, { onDelete: "cascade" }),
    bestTime: text("best_time").notNull(),
    averageTime: text("average_time").notNull(),
    worstTime: text("worst_time").notNull(),
    space: text("space").notNull(),
    isStable: boolean("is_stable"),
    requiresSorted: boolean("requires_sorted"),
    ...timestamps,
  },
  (table) => [
    unique("algorithm_complexities_algorithm_id_unique").on(table.algorithmId),
  ],
);

export type AlgorithmComplexity =
  typeof algorithmComplexitiesTable.$inferSelect;
export type NewAlgorithmComplexity =
  typeof algorithmComplexitiesTable.$inferInsert;
