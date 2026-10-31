import type { Metadata } from "next";
import { Suspense } from "react";
import { getAlgorithmCatalog } from "@/features/catalog/queries";
import {
  EditAlgorithmView,
  EditAlgorithmViewSkeleton,
} from "./_components/edit-algorithm-view";

export async function generateStaticParams() {
  const algorithms = await getAlgorithmCatalog();
  if (algorithms.length === 0) {
    return [{ slug: "placeholder" }];
  }
  return algorithms.map((algorithm) => ({ slug: algorithm.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/algorithms/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = (await getAlgorithmCatalog()).find(
    (entry) => entry.slug === slug,
  );
  return { title: algorithm ? `Sửa ${algorithm.name}` : "Không tìm thấy" };
}

export default function EditAlgorithmPage({
  params,
}: PageProps<"/admin/algorithms/[slug]">) {
  return (
    <Suspense fallback={<EditAlgorithmViewSkeleton />}>
      <EditAlgorithmView params={params} />
    </Suspense>
  );
}
