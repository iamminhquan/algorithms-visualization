import type { Metadata } from "next";
import Link from "next/link";
import { AlgorithmCard } from "@/features/catalog/components/algorithm-card";
import { getCategoryCatalog } from "@/features/catalog/queries";
import { getVisualizationHref } from "@/features/catalog/routes";
import { SITE_NAME } from "@/lib/site";
import { EmptyCategory } from "./_components/empty-category";

export const metadata: Metadata = {
  title: `Mô phỏng thuật toán | ${SITE_NAME}`,
};

export default async function VisualizationPage() {
  const categories = await getCategoryCatalog();

  return (
    <main className="flex flex-1 flex-col px-4 pt-16 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto flex w-full max-w-310 flex-col gap-14">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Mô phỏng thuật toán
          </h1>
          <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
            Chọn một thuật toán để xem nó chạy từng bước, hoặc mở một danh mục
            để xem tất cả thuật toán cùng nhóm.
          </p>
        </header>
        {categories.length === 0 ? (
          <p className="text-text-secondary">Chưa có danh mục nào.</p>
        ) : (
          categories.map((category) => (
            <section
              key={category.slug}
              aria-labelledby={`category-${category.slug}`}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1">
                <h2
                  id={`category-${category.slug}`}
                  className="text-2xl font-semibold text-text-primary"
                >
                  <Link
                    href={getVisualizationHref(category.slug)}
                    className="rounded-sm transition-colors hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
                  >
                    {category.name}
                  </Link>
                </h2>
                {category.description && (
                  <p className="text-text-secondary">{category.description}</p>
                )}
              </div>
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
            </section>
          ))
        )}
      </div>
    </main>
  );
}
