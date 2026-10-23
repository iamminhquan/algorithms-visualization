import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { VisualizerSkeleton } from "@/components/visualization/visualizer-frame";
import { AlgorithmVisualizer } from "@/features/catalog/components/algorithm-visualizer";
import { getAlgorithmBySlug } from "@/features/catalog/queries";
import { getCategoryHref, VISUALIZATION_PATH } from "@/features/catalog/routes";

type AlgorithmViewProps = Pick<
  PageProps<"/visualization/[category]/[algorithm]">,
  "params"
>;

export async function AlgorithmView({ params }: AlgorithmViewProps) {
  const { category, algorithm: algorithmSlug } = await params;
  const algorithm = await getAlgorithmBySlug(category, algorithmSlug);
  if (!algorithm) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Mô phỏng", href: VISUALIZATION_PATH },
            {
              label: algorithm.category.name,
              href: getCategoryHref(algorithm.category.slug),
            },
            { label: algorithm.name },
          ]}
        />
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {algorithm.name}
        </h1>
        {algorithm.description && (
          <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
            {algorithm.description}
          </p>
        )}
      </header>
      <AlgorithmVisualizer algorithmKey={algorithm.key} />
    </article>
  );
}

export function AlgorithmViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-64 rounded bg-bg-subtle" />
        <div className="h-10 w-80 max-w-full rounded-lg bg-bg-subtle" />
        <div className="h-15 w-full max-w-160 rounded-lg bg-bg-subtle" />
      </div>
      <VisualizerSkeleton />
    </div>
  );
}
