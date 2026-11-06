import { relations } from "drizzle-orm";
import { algorithmsTable, categoriesTable, runsTable } from "./algorithms";
import { accountsTable, sessionsTable, usersTable } from "./auth";
import { algorithmComplexitiesTable } from "./complexities";
import { algorithmSourceCodesTable } from "./sources";

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
    complexity: one(algorithmComplexitiesTable, {
      fields: [algorithmsTable.id],
      references: [algorithmComplexitiesTable.algorithmId],
    }),
    runs: many(runsTable),
    sourceCodes: many(algorithmSourceCodesTable),
  }),
);

export const algorithmComplexitiesRelations = relations(
  algorithmComplexitiesTable,
  ({ one }) => ({
    algorithm: one(algorithmsTable, {
      fields: [algorithmComplexitiesTable.algorithmId],
      references: [algorithmsTable.id],
    }),
  }),
);

export const algorithmSourceCodesRelations = relations(
  algorithmSourceCodesTable,
  ({ one }) => ({
    algorithm: one(algorithmsTable, {
      fields: [algorithmSourceCodesTable.algorithmId],
      references: [algorithmsTable.id],
    }),
  }),
);

export const runsRelations = relations(runsTable, ({ one }) => ({
  algorithm: one(algorithmsTable, {
    fields: [runsTable.algorithmId],
    references: [algorithmsTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));
