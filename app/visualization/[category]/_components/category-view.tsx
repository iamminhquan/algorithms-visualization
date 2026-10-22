import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getCategoryBySlug } from "@/features/catalog/queries";
import { VISUALIZATION_PATH } from "@/features/catalog/routes";
import { AlgorithmGrid } from "../../_components/algorithm-grid";

type CategoryViewProps = Pick<PageProps<"/visualization/[category]">, "params">;

export async function CategoryView({ params }: CategoryViewProps) {
  const category = await getCategoryBySlug((await params).category);
  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Mô phỏng", href: VISUALIZATION_PATH },
            { label: category.name },
          ]}
        />
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
            {category.description}
          </p>
        )}
      </header>
      <AlgorithmGrid category={category} />
    </div>
  );
}

export function CategoryViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-40 rounded bg-bg-subtle" />
        <div className="h-10 w-72 max-w-full rounded-lg bg-bg-subtle" />
        <div className="h-15 w-full max-w-160 rounded-lg bg-bg-subtle" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 rounded-xl bg-bg-subtle" />
        <div className="h-40 rounded-xl bg-bg-subtle" />
        <div className="h-40 rounded-xl bg-bg-subtle" />
      </div>
    </div>
  );
}
