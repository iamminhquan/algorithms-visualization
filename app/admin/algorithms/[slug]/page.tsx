import type { Metadata } from "next";
import { Suspense } from "react";
import {
  EditAlgorithmView,
  EditAlgorithmViewSkeleton,
} from "./_components/edit-algorithm-view";

export async function generateMetadata({
  params,
}: PageProps<"/admin/algorithms/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Sửa ${slug}` };
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
