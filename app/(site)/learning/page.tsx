import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategoryCatalog } from "@/features/catalog/queries";
import {
  AlgorithmLibrary,
  type IAlgorithmLibraryCategory,
  type IAlgorithmLibraryItem,
} from "./_components/algorithm-library";
import {
  MyClassesSection,
  MyClassesSectionSkeleton,
} from "./_components/my-classes";

export const metadata: Metadata = {
  title: "Học tập",
};

const ALGORITHM_CATEGORY_PREFIX = /^Thuật toán\s+/i;

const LIBRARY_CATEGORY_SLUGS = [
  "sorting",
  "searching",
  "data-structures",
  "graphs",
] as const;

function getCategoryLabel(name: string): string {
  const label = name.replace(ALGORITHM_CATEGORY_PREFIX, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function LearnPage() {
  const categories = await getCategoryCatalog();
  const categoriesBySlug = new Map(
    categories.map((category) => [category.slug, category]),
  );

  const libraryCategories: readonly IAlgorithmLibraryCategory[] =
    LIBRARY_CATEGORY_SLUGS.flatMap((slug) => {
      const category = categoriesBySlug.get(slug);
      return category
        ? [{ slug: category.slug, label: getCategoryLabel(category.name) }]
        : [];
    });

  const libraryAlgorithms: readonly IAlgorithmLibraryItem[] =
    categories.flatMap((category) => {
      const categoryLabel = getCategoryLabel(category.name);
      return category.algorithms.map((algorithm) => ({
        key: algorithm.key,
        name: algorithm.name,
        slug: algorithm.slug,
        description: algorithm.description,
        categorySlug: category.slug,
        categoryLabel,
      }));
    });

  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-20">
      <div className="mx-auto flex w-full max-w-310 flex-col gap-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Học tập
          </h1>
          <p className="text-base text-text-secondary">
            Khám phá và thực hành các thuật toán.
          </p>
        </header>

        <Suspense fallback={<MyClassesSectionSkeleton />}>
          <MyClassesSection />
        </Suspense>

        <AlgorithmLibrary
          categories={libraryCategories}
          algorithms={libraryAlgorithms}
        />
      </div>
    </main>
  );
}
