import { and, eq, notExists, notInArray, sql } from "drizzle-orm";
import { db } from ".";
import { algorithmsTable, categoriesTable } from "./schema";
import { seedAlgorithms, seedCategories } from "./seed-data";

const categories = await db
  .insert(categoriesTable)
  .values([...seedCategories])
  .onConflictDoUpdate({
    target: categoriesTable.slug,
    set: {
      name: sql`excluded.name`,
      description: sql`excluded.description`,
    },
  })
  .returning({ id: categoriesTable.id, slug: categoriesTable.slug });

const categoryIdBySlug = new Map(categories.map(({ id, slug }) => [slug, id]));

await db
  .insert(algorithmsTable)
  .values(
    seedAlgorithms.map(({ categorySlug, ...algorithm }) => {
      const categoryId = categoryIdBySlug.get(categorySlug);
      if (categoryId === undefined) {
        throw new Error(`Không tìm thấy danh mục "${categorySlug}"`);
      }
      return { ...algorithm, categoryId };
    }),
  )
  .onConflictDoUpdate({
    target: algorithmsTable.key,
    set: {
      categoryId: sql`excluded.category_id`,
      name: sql`excluded.name`,
      slug: sql`excluded.slug`,
      description: sql`excluded.description`,
      timeComplexity: sql`excluded.time_complexity`,
      spaceComplexity: sql`excluded.space_complexity`,
    },
  });

/*
 * `CATEGORIES` là nguồn duy nhất của danh mục, nhưng upsert theo slug nên đổi slug sẽ để lại dòng cũ
 * (ví dụ "sap-xep") hiện trên `/visualization`. Xoá các dòng đó, trừ khi còn thuật toán trỏ tới.
 */
await db.delete(categoriesTable).where(
  and(
    notInArray(
      categoriesTable.slug,
      seedCategories.map((category) => category.slug),
    ),
    notExists(
      db
        .select({ id: algorithmsTable.id })
        .from(algorithmsTable)
        .where(eq(algorithmsTable.categoryId, categoriesTable.id)),
    ),
  ),
);

await db.$client.end();
console.log("Đã chạy seed data!!!");
