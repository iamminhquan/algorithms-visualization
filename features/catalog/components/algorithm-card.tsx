import Link from "next/link";
import type { AlgorithmCatalogItem } from "../queries";
import { getAlgorithmHref } from "../routes";
import { AlgorithmIcon } from "./algorithm-icon";

type AlgorithmCardProps = {
  categorySlug: string;
  algorithm: Pick<
    AlgorithmCatalogItem,
    "key" | "slug" | "name" | "description"
  >;
};

export function AlgorithmCard({ categorySlug, algorithm }: AlgorithmCardProps) {
  return (
    <Link
      href={getAlgorithmHref(categorySlug, algorithm.slug)}
      className="flex h-full items-center gap-4 rounded-xl border border-border-default bg-bg-surface p-5 transition-colors duration-150 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
    >
      <AlgorithmIcon algorithmKey={algorithm.key} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-lg font-semibold text-text-primary">
          {algorithm.name}
        </h3>
        {algorithm.description && (
          <p className="line-clamp-3 text-sm leading-5 text-text-secondary">
            {algorithm.description}
          </p>
        )}
      </div>
    </Link>
  );
}
