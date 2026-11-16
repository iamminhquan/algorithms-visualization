import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdminUser } from "@/features/learning/auth";
import {
  EditAlgorithmView,
  EditAlgorithmViewSkeleton,
} from "./_components/edit-algorithm-view";

export const metadata: Metadata = {
  title: "Sửa thuật toán",
};

export const instant = false;

type EditAlgorithmPageProps = Pick<
  PageProps<"/admin/algorithms/[slug]">,
  "params"
>;

export default function EditAlgorithmPage({ params }: EditAlgorithmPageProps) {
  return (
    <Suspense fallback={<EditAlgorithmViewSkeleton />}>
      <AuthorizedEditAlgorithmView params={params} />
    </Suspense>
  );
}

async function AuthorizedEditAlgorithmView({ params }: EditAlgorithmPageProps) {
  await requireAdminUser();
  return <EditAlgorithmView params={params} />;
}
