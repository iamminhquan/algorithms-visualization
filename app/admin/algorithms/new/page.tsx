import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getCategoryCatalog } from "@/features/catalog/queries";
import { ADMIN_ROUTES } from "../../_components/admin-routes";
import { PageHeader } from "../../_components/page-header";
import { AlgorithmForm } from "../_components/algorithm-form";

export const metadata: Metadata = {
  title: "Thêm thuật toán",
};

export default async function NewAlgorithmPage() {
  const categories = await getCategoryCatalog();

  return (
    <>
      <PageHeader
        title="Thêm thuật toán"
        breadcrumb={[
          { label: "Thuật toán", href: ADMIN_ROUTES.algorithms },
          { label: "Thêm mới" },
        ]}
      />
      <p className="flex items-start gap-2.5 rounded-xl border border-accent-default/30 bg-accent-subtle px-4 py-3 text-sm leading-6 text-accent-text">
        <Info aria-hidden="true" className="mt-1 size-4 shrink-0" />
        Thuật toán chỉ hiện trên trang web khi đã có cài đặt trong code
        (registry và trình mô phỏng) với key trùng key khai báo ở đây.
      </p>
      <AlgorithmForm
        categories={categories.map(({ id, name }) => ({ id, name }))}
      />
    </>
  );
}
