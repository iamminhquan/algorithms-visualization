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
