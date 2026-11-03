import { relations, sql } from "drizzle-orm";
import {
  boolean,
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

/**
 * Danh mục gom các thuật toán cùng nhóm.
 *
 * `slug`: Chữ thường không dấu nối bằng gạch ngang, ví dụ "sorting".
 */
export const categoriesTable = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
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

/**
 * Thuật toán, mỗi thuật toán thuộc một danh mục.
 *
 * `key`: Khoá nối với cài đặt trong code, ví dụ "bubble-sort" (`BUBBLE_SORT_KEY`). Không đổi sau khi tạo.
 * `slug`: Chữ thường không dấu nối bằng gạch ngang, ví dụ "bubble-sort".
 * `timeComplexity`: Ví dụ "O(n²)".
 * `spaceComplexity`: Ví dụ "O(1)".
 */
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

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  ...timestamps,
});

export const sessionsTable = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const accountsTable = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)],
);

export const verificationsTable = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
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

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Session = typeof sessionsTable.$inferSelect;
export type Account = typeof accountsTable.$inferSelect;
export type Verification = typeof verificationsTable.$inferSelect;
export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type Algorithm = typeof algorithmsTable.$inferSelect;
export type NewAlgorithm = typeof algorithmsTable.$inferInsert;
export type Run = typeof runsTable.$inferSelect;
export type NewRun = typeof runsTable.$inferInsert;
