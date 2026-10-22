import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getCategoryCatalog,
} from "@/features/catalog/queries";
import { CategoryView } from "./_components/category-view";

export async function generateStaticParams() {
  const categories = await getCategoryCatalog();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/visualization/[category]">): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).category);
  return category ? { title: category.name } : {};
}

export default async function CategoryPage({
  params,
}: PageProps<"/visualization/[category]">) {
  const category = await getCategoryBySlug((await params).category);
  if (!category) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        <CategoryView category={category} />
      </div>
    </main>
  );
}
