import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getCategoryBySlug,
  getCategoryCatalog,
} from "@/features/catalog/queries";
import {
  CategoryView,
  CategoryViewSkeleton,
} from "./_components/category-view";

export async function generateStaticParams() {
  const categories = await getCategoryCatalog();
  if (categories.length === 0) {
    /*
     * Cache Components báo lỗi build khi mảng rỗng (DB chưa seed), nên trả tham số giữ chỗ;
     * slug này không có trong DB nên trang gọi `notFound()`.
     */
    return [{ category: "placeholder" }];
  }
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/visualization/[category]">): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).category);
  return category
    ? { title: category.name }
    : { title: "Không tìm thấy trang" };
}

export default function CategoryPage({
  params,
}: PageProps<"/visualization/[category]">) {
  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-24 sm:px-8 lg:px-20">
      <div className="mx-auto w-full max-w-310">
        <Suspense fallback={<CategoryViewSkeleton />}>
          <CategoryView params={params} />
        </Suspense>
      </div>
    </main>
  );
}
