import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  COMPARISON_PARAMS,
  resolveComparisonLanes,
} from "@/engine/visualization";
import { getCategoryBySlug } from "@/features/catalog/queries";
import { getCategoryHref, VISUALIZATION_PATH } from "@/features/catalog/routes";
import {
  type ISortingComparisonOption,
  SortingComparison,
} from "@/features/sorting-algorithms/components/sorting-comparison";
import { findSortingVisualConfig } from "@/features/sorting-algorithms/visual-configs";

type CompareViewProps = Pick<
  PageProps<"/visualization/[category]/compare">,
  "params" | "searchParams"
>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function CompareView({ params, searchParams }: CompareViewProps) {
  const [{ category: categorySlug }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const category = await getCategoryBySlug(categorySlug);
  if (!category || category.slug !== "sorting") {
    notFound();
  }

  const options: ISortingComparisonOption[] = category.algorithms
    .filter((algorithm) => findSortingVisualConfig(algorithm.key))
    .map(({ key, slug, name }) => ({ key, slug, name }));
  const lanes = resolveComparisonLanes(
    options.map((option) => option.slug),
    COMPARISON_PARAMS.map((param) => firstValue(query[param])),
  );

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Mô phỏng", href: VISUALIZATION_PATH },
            { label: category.name, href: getCategoryHref(category.slug) },
            { label: "So sánh" },
          ]}
        />
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          So sánh thuật toán sắp xếp
        </h1>
        <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
          {lanes
            ? `Chạy ${lanes.length} thuật toán trên cùng một mảng để xem thuật toán nào cần ít bước, ít so sánh và ít hoán đổi hơn.`
            : "Chạy các thuật toán trên cùng một mảng để so sánh số bước, số lần so sánh và số lần hoán đổi."}
        </p>
      </header>
      {lanes ? (
        <SortingComparison
          key={lanes.join(",")}
          options={options}
          initialLanes={lanes}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-border-strong bg-bg-subtle p-6 text-center text-text-secondary">
          Danh mục này cần ít nhất hai thuật toán để so sánh.
        </p>
      )}
    </div>
  );
}

export function CompareViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-64 rounded bg-bg-subtle" />
        <div className="h-10 w-96 max-w-full rounded-lg bg-bg-subtle" />
        <div className="h-15 w-full max-w-160 rounded-lg bg-bg-subtle" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-32 rounded-xl bg-bg-subtle sm:h-24" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-120 rounded-xl bg-bg-subtle" />
          <div className="h-120 rounded-xl bg-bg-subtle" />
          <div className="h-120 rounded-xl bg-bg-subtle" />
          <div className="h-120 rounded-xl bg-bg-subtle" />
        </div>
        <div className="h-16 rounded-xl bg-bg-subtle" />
      </div>
    </div>
  );
}
