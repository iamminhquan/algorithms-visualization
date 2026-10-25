import { Play } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ICategory } from "../categories";
import { getCategoryHref } from "../routes";

type CategoryCardProps = {
  category: ICategory;
  illustration: ReactNode;
  simulationCount: number;
};

export function CategoryCard({
  category,
  illustration,
  simulationCount,
}: CategoryCardProps) {
  return (
    <Link
      href={getCategoryHref(category.slug)}
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
      <p className="mt-auto pt-1 text-xs font-medium">
        {simulationCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-2.5 py-1 text-text-secondary">
            <Play aria-hidden="true" className="size-3" />
            {simulationCount} mô phỏng
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-dashed border-border-strong px-2.5 py-1 text-text-muted">
            Sắp ra mắt
          </span>
        )}
      </p>
    </Link>
  );
}
