import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AlgorithmCard } from "@/features/catalog/components/algorithm-card";
import type { CategoryCatalogItem } from "@/features/catalog/queries";
import { VISUALIZATION_PATH } from "@/features/catalog/routes";
import { EmptyCategory } from "../../_components/empty-category";

type CategoryViewProps = {
  category: CategoryCatalogItem;
};

export function CategoryView({ category }: CategoryViewProps) {
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
      {category.algorithms.length === 0 ? (
        <EmptyCategory />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {category.algorithms.map((algorithm) => (
            <li key={algorithm.slug}>
              <AlgorithmCard algorithm={algorithm} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
