import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAlgorithmBySlug,
  getAlgorithmCatalog,
} from "@/features/catalog/queries";
import { AlgorithmView } from "./_components/algorithm-view";

export async function generateStaticParams() {
  const algorithms = await getAlgorithmCatalog();
  return algorithms.map((algorithm) => ({
    category: algorithm.category.slug,
    algorithm: algorithm.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/visualization/[category]/[algorithm]">): Promise<Metadata> {
  const { category, algorithm } = await params;
  const entry = await getAlgorithmBySlug(category, algorithm);
  return entry ? { title: entry.name } : {};
}

export default async function AlgorithmPage({
  params,
}: PageProps<"/visualization/[category]/[algorithm]">) {
  const { category, algorithm } = await params;
  const entry = await getAlgorithmBySlug(category, algorithm);
  if (!entry) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        <AlgorithmView algorithm={entry} />
      </div>
    </main>
  );
}
