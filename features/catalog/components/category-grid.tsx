import type { ReactNode } from "react";
import { CATEGORIES, type CategorySlug } from "../categories";
import { CategoryCard } from "./category-card";
import { CoreConceptsIllustration } from "./illustrations/core-concepts-illustration";
import { DataStructureIllustration } from "./illustrations/data-structure-illustration";
import { SearchingIllustration } from "./illustrations/searching-illustration";
import { SortingIllustration } from "./illustrations/sorting-illustration";

const ILLUSTRATIONS = {
  "sap-xep": <SortingIllustration />,
  "cau-truc-du-lieu": <DataStructureIllustration />,
  "tim-kiem": <SearchingIllustration />,
  "khai-niem-cot-loi": <CoreConceptsIllustration />,
} satisfies Record<CategorySlug, ReactNode>;

export function CategoryGrid() {
  return (
    <section aria-label="Danh mục thuật toán" className="w-full max-w-310">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <CategoryCard
              category={category}
              illustration={ILLUSTRATIONS[category.slug]}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
