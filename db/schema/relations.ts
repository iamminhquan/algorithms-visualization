import { relations } from "drizzle-orm";
import { algorithmsTable, categoriesTable, runsTable } from "./algorithms";
import { accountsTable, sessionsTable, usersTable } from "./auth";
import { algorithmCodeSnippetsTable } from "./sources";

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
    codeSnippets: many(algorithmCodeSnippetsTable),
  }),
);

export const algorithmCodeSnippetsRelations = relations(
  algorithmCodeSnippetsTable,
  ({ one }) => ({
    algorithm: one(algorithmsTable, {
      fields: [algorithmCodeSnippetsTable.algorithmId],
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
