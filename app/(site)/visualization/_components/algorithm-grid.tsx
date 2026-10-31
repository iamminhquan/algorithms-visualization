import { AlgorithmCard } from "@/features/catalog/components/algorithm-card";
import type { CategoryCatalogItem } from "@/features/catalog/queries";

type AlgorithmGridProps = {
  category: Pick<CategoryCatalogItem, "slug" | "algorithms">;
};

export function AlgorithmGrid({ category }: AlgorithmGridProps) {
  if (category.algorithms.length === 0) {
    return <EmptyCategory />;
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {category.algorithms.map((algorithm) => (
        <li key={algorithm.slug}>
          <AlgorithmCard categorySlug={category.slug} algorithm={algorithm} />
        </li>
      ))}
    </ul>
  );
}

function EmptyCategory() {
  return (
    <p className="rounded-xl border border-dashed border-border-strong px-6 py-10 text-center text-text-secondary">
      Chưa có thuật toán nào trong danh mục này.
    </p>
  );
}
