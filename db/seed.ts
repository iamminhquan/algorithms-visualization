import { sql } from "drizzle-orm";
import { db } from ".";
import {
  algorithmComplexitiesTable,
  algorithmsTable,
  categoriesTable,
} from "./schema";
import { seedAlgorithms, seedCategories, seedComplexities } from "./seed-data";

await db
  .insert(categoriesTable)
  .values([...seedCategories])
  .onConflictDoNothing();

const categories = await db
  .select({ id: categoriesTable.id, slug: categoriesTable.slug })
  .from(categoriesTable);

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

const algorithms = await db
  .select({ id: algorithmsTable.id, key: algorithmsTable.key })
  .from(algorithmsTable);

const algorithmIdByKey = new Map(algorithms.map(({ id, key }) => [key, id]));

await db
  .insert(algorithmComplexitiesTable)
  .values(
    seedComplexities.map(({ algorithmKey, ...complexity }) => {
      const algorithmId = algorithmIdByKey.get(algorithmKey);
      if (algorithmId === undefined) {
        throw new Error(`Không tìm thấy thuật toán "${algorithmKey}"`);
      }
      return { ...complexity, algorithmId };
    }),
  )
  .onConflictDoUpdate({
    target: algorithmComplexitiesTable.algorithmId,
    set: {
      bestTime: sql`excluded.best_time`,
      averageTime: sql`excluded.average_time`,
      worstTime: sql`excluded.worst_time`,
      space: sql`excluded.space`,
      isStable: sql`excluded.is_stable`,
      requiresSorted: sql`excluded.requires_sorted`,
    },
  });

await db.$client.end();
console.log("Đã chạy seed data!!!");
