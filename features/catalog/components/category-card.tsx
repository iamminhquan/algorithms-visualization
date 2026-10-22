import Link from "next/link";
import type { ReactNode } from "react";
import type { ICategory } from "../categories";
import { getVisualizationHref } from "../routes";

type CategoryCardProps = {
  category: ICategory;
  illustration: ReactNode;
};

export function CategoryCard({ category, illustration }: CategoryCardProps) {
  return (
    <Link
      href={getVisualizationHref(category.slug)}
      className="relative top-0 flex h-full flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4 transition-[top,border-color] duration-150 hover:-top-0.5 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default motion-reduce:transition-colors motion-reduce:hover:top-0"
    >
      <div className="aspect-368/200 overflow-hidden rounded-lg bg-bg-subtle">
        {illustration}
      </div>
      <h2 className="text-lg font-semibold text-text-primary">
        {category.name}
      </h2>
      <p className="text-sm leading-5 text-text-secondary">
        {category.description}
      </p>
    </Link>
  );
}
