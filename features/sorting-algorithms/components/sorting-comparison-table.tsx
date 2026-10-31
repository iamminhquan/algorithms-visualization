import { GitCompare } from "lucide-react";
import Link from "next/link";
import { getButtonClassName } from "@/components/ui/button";
import type { Algorithm } from "@/db/schema";
import { findSortingComplexity } from "../complexity";

type SortingComparisonTableProps = {
  algorithms: readonly Pick<Algorithm, "key" | "slug" | "name">[];
  compareHref?: string;
};

const COLUMNS = [
  "Thuật toán",
  "Tốt nhất",
  "Trung bình",
  "Xấu nhất",
  "Bộ nhớ",
  "Ổn định",
] as const;

/**
 * Bảng so sánh độ phức tạp của các thuật toán sắp xếp đang có trong danh mục. Thuật toán nào
 * chưa có số liệu thì bị bỏ qua, và không có dòng nào thì không vẽ bảng.
 */
export function SortingComparisonTable({
  algorithms,
  compareHref,
}: SortingComparisonTableProps) {
  const rows = algorithms.flatMap((algorithm) => {
    const complexity = findSortingComplexity(algorithm.key);
    return complexity ? [{ algorithm, complexity }] : [];
  });
  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="sorting-comparison-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="sorting-comparison-heading"
          className="text-2xl font-semibold tracking-tight text-text-primary"
        >
          Bảng so sánh các thuật toán sắp xếp
        </h2>
        {compareHref && (
          <Link href={compareHref} className={getButtonClassName("secondary")}>
            <GitCompare aria-hidden="true" />
            So sánh trực quan
          </Link>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border-default bg-bg-surface">
        <table className="w-full min-w-170 border-collapse text-left text-sm">
          <thead className="bg-bg-subtle text-text-primary">
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} scope="col" className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ algorithm, complexity }) => (
              <tr
                key={algorithm.slug}
                className="border-t border-border-default"
              >
                <th
                  scope="row"
                  className="px-5 py-3.5 font-medium text-text-primary"
                >
                  {algorithm.name}
                </th>
                <td className="px-5 py-3.5 font-mono text-text-secondary">
                  {complexity.bestTime}
                </td>
                <td className="px-5 py-3.5 font-mono text-text-secondary">
                  {complexity.averageTime}
                </td>
                <td className="px-5 py-3.5 font-mono text-text-secondary">
                  {complexity.worstTime}
                </td>
                <td className="px-5 py-3.5 font-mono text-text-secondary">
                  {complexity.space}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {complexity.isStable ? "Có" : "Không"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
