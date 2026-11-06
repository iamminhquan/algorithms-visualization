import { Layers } from "lucide-react";
import type { ReactNode } from "react";
import { getCategoryCatalog } from "../queries";
import { CategoryCard } from "./category-card";
import { CoreConceptsIllustration } from "./illustrations/core-concepts-illustration";
import { DataStructureIllustration } from "./illustrations/data-structure-illustration";
import { GraphIllustration } from "./illustrations/graph-illustration";
import { SearchingIllustration } from "./illustrations/searching-illustration";
import { SortingIllustration } from "./illustrations/sorting-illustration";
import { TreeIllustration } from "./illustrations/tree-illustration";

const ILLUSTRATIONS: Readonly<Record<string, ReactNode>> = {
  sorting: <SortingIllustration />,
  "data-structures": <DataStructureIllustration />,
  searching: <SearchingIllustration />,
  "core-concepts": <CoreConceptsIllustration />,
  graphs: <GraphIllustration />,
  trees: <TreeIllustration />,
};

function getIllustration(slug: string): ReactNode {
  return (
    ILLUSTRATIONS[slug] ?? (
      <div className="flex h-full items-center justify-center bg-bg-subtle text-text-muted">
        <Layers aria-hidden="true" className="size-10" />
      </div>
    )
  );
}

export async function CategoryGrid() {
  const categories = await getCategoryCatalog();

  return (
    <section aria-label="Danh mục thuật toán" className="w-full max-w-310">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <CategoryCard
              category={category}
              illustration={getIllustration(category.slug)}
              simulationCount={category.algorithms.length}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
