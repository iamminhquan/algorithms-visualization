import Link from "next/link";
import type { AlgorithmCatalogItem } from "../queries";
import { getAlgorithmHref } from "../routes";

type AlgorithmCardProps = {
  categorySlug: string;
  algorithm: Pick<
    AlgorithmCatalogItem,
    "slug" | "name" | "description" | "timeComplexity" | "spaceComplexity"
  >;
};

export function AlgorithmCard({ categorySlug, algorithm }: AlgorithmCardProps) {
  return (
    <Link
      href={getAlgorithmHref(categorySlug, algorithm.slug)}
      className="flex h-full flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5 transition-colors duration-150 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
    >
      <h3 className="text-lg font-semibold text-text-primary">
        {algorithm.name}
      </h3>
      {algorithm.description && (
        <p className="line-clamp-3 text-sm leading-5 text-text-secondary">
          {algorithm.description}
        </p>
      )}
      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-text-secondary">Thời gian</dt>
          <dd className="font-mono text-text-primary">
            {algorithm.timeComplexity ?? "—"}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-text-secondary">Bộ nhớ</dt>
          <dd className="font-mono text-text-primary">
            {algorithm.spaceComplexity ?? "—"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
