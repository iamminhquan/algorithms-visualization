import "server-only";
import { db } from "@/db";
import { findAlgorithm } from "./catalog";

/**
 * Danh sách thuật toán hiển thị cho người dùng, đọc từ bảng `algorithms` kèm danh mục.
 * Dòng nào chưa có cài đặt trong registry thì bị ẩn, vì không chạy được.
 *
 * @returns Các thuật toán chạy được, sắp theo id.
 */
export async function getAlgorithmCatalog() {
  "use cache";
  const rows = await db.query.algorithmsTable.findMany({
    with: { category: true },
    orderBy: (algorithms, { asc }) => asc(algorithms.id),
  });
  return rows.filter((row) => findAlgorithm(row.key) !== undefined);
}

/**
 * Các danh mục kèm thuật toán chạy được của từng danh mục. Danh mục chưa có thuật toán nào
 * vẫn được trả về, với mảng `algorithms` rỗng.
 *
 * @returns Các danh mục sắp theo id, thuật toán trong mỗi danh mục cũng sắp theo id.
 */
export async function getCategoryCatalog() {
  "use cache";
  const rows = await db.query.categoriesTable.findMany({
    with: {
      algorithms: { orderBy: (algorithms, { asc }) => asc(algorithms.id) },
    },
    orderBy: (categories, { asc }) => asc(categories.id),
  });
  return rows.map((category) => ({
    ...category,
    algorithms: category.algorithms.filter(
      (algorithm) => findAlgorithm(algorithm.key) !== undefined,
    ),
  }));
}

export type AlgorithmCatalogItem = Awaited<
  ReturnType<typeof getAlgorithmCatalog>
>[number];

export type CategoryCatalogItem = Awaited<
  ReturnType<typeof getCategoryCatalog>
>[number];

export type VisualizationEntry =
  | { readonly type: "category"; readonly category: CategoryCatalogItem }
  | { readonly type: "algorithm"; readonly algorithm: AlgorithmCatalogItem };

/**
 * Tìm trang ứng với một slug của `/visualization/[slug]`. Danh mục được tra trước thuật toán;
 * test seed-data bảo đảm hai bên không trùng slug.
 *
 * @param slug Slug lấy từ URL.
 * @returns Danh mục hoặc thuật toán mang slug này, hoặc `undefined` nếu không có.
 */
export async function findVisualizationEntry(
  slug: string,
): Promise<VisualizationEntry | undefined> {
  const category = (await getCategoryCatalog()).find(
    (item) => item.slug === slug,
  );
  if (category) {
    return { type: "category", category };
  }
  const algorithm = (await getAlgorithmCatalog()).find(
    (item) => item.slug === slug,
  );
  return algorithm ? { type: "algorithm", algorithm } : undefined;
}

/**
 * Mọi slug của `/visualization/[slug]`, gồm cả danh mục lẫn thuật toán.
 */
export async function listVisualizationSlugs(): Promise<string[]> {
  const [categories, algorithms] = await Promise.all([
    getCategoryCatalog(),
    getAlgorithmCatalog(),
  ]);
  return [...categories, ...algorithms].map((item) => item.slug);
}
