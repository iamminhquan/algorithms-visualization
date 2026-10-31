import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategoryBySlug } from "@/features/catalog/queries";
import { CompareView, CompareViewSkeleton } from "./_components/compare-view";

export function generateStaticParams() {
  return [{ category: "sorting" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/visualization/[category]/compare">): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).category);
  if (!category || category.slug !== "sorting") {
    return { title: "Không tìm thấy trang" };
  }
  return {
    title: `So sánh ${category.name.charAt(0).toLowerCase()}${category.name.slice(1)}`,
  };
}

export default function ComparePage({
  params,
  searchParams,
}: PageProps<"/visualization/[category]/compare">) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        <Suspense fallback={<CompareViewSkeleton />}>
          <CompareView params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
