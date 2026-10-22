import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { AlgorithmCatalogItem } from "@/features/catalog/queries";
import {
  getVisualizationHref,
  VISUALIZATION_PATH,
} from "@/features/catalog/routes";

type AlgorithmViewProps = {
  algorithm: AlgorithmCatalogItem;
};

export function AlgorithmView({ algorithm }: AlgorithmViewProps) {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Mô phỏng", href: VISUALIZATION_PATH },
            {
              label: algorithm.category.name,
              href: getVisualizationHref(algorithm.category.slug),
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
        <dl className="grid max-w-md grid-cols-2 gap-4">
          <ComplexityItem
            label="Độ phức tạp thời gian"
            value={algorithm.timeComplexity}
          />
          <ComplexityItem
            label="Độ phức tạp bộ nhớ"
            value={algorithm.spaceComplexity}
          />
        </dl>
      </header>
      <section
        aria-label="Mô phỏng"
        className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-subtle p-6 text-center text-text-secondary"
      >
        Phần mô phỏng đang được xây dựng.
      </section>
    </article>
  );
}

type ComplexityItemProps = {
  label: string;
  value: string | null;
};

function ComplexityItem({ label, value }: ComplexityItemProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border-default bg-bg-surface p-4">
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className="font-mono text-lg text-text-primary">{value ?? "—"}</dd>
    </div>
  );
}
