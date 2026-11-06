"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlgorithmCard } from "@/features/catalog/components/algorithm-card";
import { cn } from "@/lib/cn";

export interface IAlgorithmLibraryCategory {
  readonly slug: string;
  readonly label: string;
}

export interface IAlgorithmLibraryItem {
  readonly key: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly categorySlug: string;
  readonly categoryLabel: string;
}

type AlgorithmLibraryProps = {
  categories: readonly IAlgorithmLibraryCategory[];
  algorithms: readonly IAlgorithmLibraryItem[];
};

const ALL_CATEGORY_SLUG = "all";

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function AlgorithmLibrary({
  categories,
  algorithms,
}: AlgorithmLibraryProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<string>(ALL_CATEGORY_SLUG);

  const normalizedQuery = normalizeSearchText(query.trim());
  const visibleAlgorithms = algorithms.filter((algorithm) => {
    if (
      activeCategory !== ALL_CATEGORY_SLUG &&
      algorithm.categorySlug !== activeCategory
    ) {
      return false;
    }
    if (normalizedQuery === "") {
      return true;
    }
    return normalizeSearchText(
      `${algorithm.name} ${algorithm.categoryLabel}`,
    ).includes(normalizedQuery);
  });

  return (
    <section
      aria-labelledby="algorithm-library"
      className="flex flex-col gap-5"
    >
      <h2
        id="algorithm-library"
        className="text-xl font-semibold tracking-tight text-text-primary"
      >
        Thư viện thuật toán
      </h2>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm thuật toán..."
            aria-label="Tìm thuật toán"
            className="pl-9"
          />
        </div>

        <fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Lọc theo danh mục</legend>
          <FilterChip
            active={activeCategory === ALL_CATEGORY_SLUG}
            onClick={() => setActiveCategory(ALL_CATEGORY_SLUG)}
          >
            Tất cả
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category.slug}
              active={activeCategory === category.slug}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.label}
            </FilterChip>
          ))}
        </fieldset>
      </div>

      {visibleAlgorithms.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-bg-surface px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">
            Không tìm thấy thuật toán phù hợp.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleAlgorithms.map((algorithm) => (
            <li key={algorithm.slug}>
              <AlgorithmCard
                categorySlug={algorithm.categorySlug}
                algorithm={algorithm}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type FilterChipProps = {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: string;
};

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
        active
          ? "border-accent-default bg-accent-subtle text-accent-text"
          : "border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}
