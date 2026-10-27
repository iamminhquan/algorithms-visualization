import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import "server-only";
import { findAlgorithm } from "./catalog";
import { CATEGORIES } from "./categories";

const CATALOG_CACHE_TAG = "catalog";

const CATEGORY_ORDER: ReadonlyMap<string, number> = new Map(
  CATEGORIES.map((category, index) => [category.slug, index]),
);

function getCategoryOrder(slug: string): number {
  return CATEGORY_ORDER.get(slug) ?? CATEGORIES.length;
}

export async function getAlgorithmCatalog() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await db.query.algorithmsTable.findMany({
    with: { category: true },
    orderBy: (algorithms, { asc }) => asc(algorithms.id),
  });
  return rows.filter((row) => findAlgorithm(row.key) !== undefined);
}

export async function getCategoryCatalog() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await db.query.categoriesTable.findMany({
    with: {
      algorithms: { orderBy: (algorithms, { asc }) => asc(algorithms.id) },
    },
    orderBy: (categories, { asc }) => asc(categories.id),
  });
  return rows
    .map((category) => ({
      ...category,
      algorithms: category.algorithms.filter(
        (algorithm) => findAlgorithm(algorithm.key) !== undefined,
      ),
    }))
    .sort((a, b) => getCategoryOrder(a.slug) - getCategoryOrder(b.slug));
}

export type AlgorithmCatalogItem = Awaited<
  ReturnType<typeof getAlgorithmCatalog>
>[number];

export type CategoryCatalogItem = Awaited<
  ReturnType<typeof getCategoryCatalog>
>[number];

export async function getCategoryBySlug(
  categorySlug: string,
): Promise<CategoryCatalogItem | undefined> {
  return (await getCategoryCatalog()).find(
    (category) => category.slug === categorySlug,
  );
}

export async function getAlgorithmBySlug(
  categorySlug: string,
  algorithmSlug: string,
): Promise<AlgorithmCatalogItem | undefined> {
  return (await getAlgorithmCatalog()).find(
    (algorithm) =>
      algorithm.slug === algorithmSlug &&
      algorithm.category.slug === categorySlug,
  );
}
