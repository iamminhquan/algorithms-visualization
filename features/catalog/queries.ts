import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { findAlgorithm } from "./catalog";

/**
 * Tag chung cho mọi query danh mục, để sau này một Server Function sửa dữ liệu gọi
 * `revalidateTag(CATALOG_CACHE_TAG)` là làm mới được cả trang chủ lẫn `/visualization`.
 */
const CATALOG_CACHE_TAG = "catalog";

/**
 * Danh sách thuật toán hiển thị cho người dùng, đọc từ bảng `algorithms` kèm danh mục.
 * Dòng nào chưa có cài đặt trong registry thì bị ẩn, vì không chạy được.
 *
 * @returns Các thuật toán chạy được, sắp theo id.
 */
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

/**
 * Các danh mục kèm thuật toán chạy được của từng danh mục. Danh mục chưa có thuật toán nào
 * vẫn được trả về, với mảng `algorithms` rỗng.
 *
 * @returns Các danh mục sắp theo id, thuật toán trong mỗi danh mục cũng sắp theo id.
 */
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

/**
 * Tìm danh mục cho trang `/visualization/[category]`.
 *
 * @param categorySlug Slug lấy từ URL.
 * @returns Danh mục mang slug này, hoặc `undefined` nếu không có.
 */
export async function getCategoryBySlug(
  categorySlug: string,
): Promise<CategoryCatalogItem | undefined> {
  return (await getCategoryCatalog()).find(
    (category) => category.slug === categorySlug,
  );
}

/**
 * Tìm thuật toán cho trang `/visualization/[category]/[algorithm]`. Slug thuật toán đã là duy nhất,
 * nhưng vẫn phải khớp danh mục để mỗi thuật toán chỉ có một URL.
 *
 * @param categorySlug Slug danh mục lấy từ URL.
 * @param algorithmSlug Slug thuật toán lấy từ URL.
 * @returns Thuật toán mang slug này trong đúng danh mục, hoặc `undefined` nếu không có.
 */
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
