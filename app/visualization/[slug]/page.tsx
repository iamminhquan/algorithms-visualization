import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  findVisualizationEntry,
  listVisualizationSlugs,
} from "@/features/catalog/queries";
import { SITE_NAME } from "@/lib/site";
import { AlgorithmView } from "./_components/algorithm-view";
import { CategoryView } from "./_components/category-view";

export async function generateStaticParams() {
  const slugs = await listVisualizationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/visualization/[slug]">): Promise<Metadata> {
  const entry = await findVisualizationEntry((await params).slug);
  if (!entry) {
    return { title: SITE_NAME };
  }
  const name =
    entry.type === "category" ? entry.category.name : entry.algorithm.name;
  return { title: `${name} | ${SITE_NAME}` };
}

export default async function VisualizationEntryPage({
  params,
}: PageProps<"/visualization/[slug]">) {
  const entry = await findVisualizationEntry((await params).slug);
  if (!entry) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        {entry.type === "category" ? (
          <CategoryView category={entry.category} />
        ) : (
          <AlgorithmView algorithm={entry.algorithm} />
        )}
      </div>
    </main>
  );
}
