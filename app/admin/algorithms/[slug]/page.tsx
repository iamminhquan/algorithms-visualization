import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdminUser } from "@/features/learning/auth";
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

export default async function EditAlgorithmPage({
  params,
}: PageProps<"/admin/algorithms/[slug]">) {
  await requireAdminUser();
  return (
    <Suspense fallback={<EditAlgorithmViewSkeleton />}>
      <EditAlgorithmView params={params} />
    </Suspense>
  );
}
