import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getAlgorithmBySlug,
  getAlgorithmCatalog,
} from "@/features/catalog/queries";
import {
  AlgorithmView,
  AlgorithmViewSkeleton,
} from "./_components/algorithm-view";

export async function generateStaticParams() {
  const algorithms = await getAlgorithmCatalog();
  if (algorithms.length === 0) {
    /*
     * Cache Components báo lỗi build khi mảng rỗng (DB chưa seed), nên trả tham số giữ chỗ;
     * slug này không có trong DB nên trang gọi `notFound()`.
     */
    return [{ category: "placeholder", algorithm: "placeholder" }];
  }
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
  return entry ? { title: entry.name } : { title: "Không tìm thấy trang" };
}

export default function AlgorithmPage({
  params,
}: PageProps<"/visualization/[category]/[algorithm]">) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        <Suspense fallback={<AlgorithmViewSkeleton />}>
          <AlgorithmView params={params} />
        </Suspense>
      </div>
    </main>
  );
}
