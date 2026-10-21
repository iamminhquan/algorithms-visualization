import { sql } from "drizzle-orm";
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

await db.$client.end();
console.log("Đã chạy seed data!!!");
