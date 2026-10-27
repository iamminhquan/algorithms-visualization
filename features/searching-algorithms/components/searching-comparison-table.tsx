import type { Algorithm } from "@/db/schema";
import { findSearchingComplexity } from "../complexity";

type SearchingComparisonTableProps = {
  algorithms: readonly Pick<Algorithm, "key" | "slug" | "name">[];
};

const COLUMNS = [
  "Thuật toán",
  "Tốt nhất",
  "Trung bình",
  "Xấu nhất",
  "Bộ nhớ",
  "Cần mảng đã sắp xếp",
] as const;

export function SearchingComparisonTable({
  algorithms,
}: SearchingComparisonTableProps) {
  const rows = algorithms.flatMap((algorithm) => {
    const complexity = findSearchingComplexity(algorithm.key);
    return complexity ? [{ algorithm, complexity }] : [];
  });
  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="searching-comparison-heading"
      className="flex flex-col gap-4"
    >
      <h2
        id="searching-comparison-heading"
        className="text-2xl font-semibold tracking-tight text-text-primary"
      >
        Bảng so sánh các thuật toán tìm kiếm
      </h2>
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
                  {complexity.requiresSorted ? "Có" : "Không"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
