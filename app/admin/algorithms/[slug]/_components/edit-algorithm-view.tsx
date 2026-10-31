import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getButtonClassName } from "@/components/ui/button";
import {
  getAlgorithmCatalog,
  getCategoryCatalog,
} from "@/features/catalog/queries";
import { getAlgorithmHref } from "@/features/catalog/routes";
import { findSourceCode } from "@/features/catalog/source-codes";
import { ADMIN_ROUTES } from "../../../_components/admin-routes";
import { PageHeader } from "../../../_components/page-header";
import { AlgorithmForm } from "../../_components/algorithm-form";

type EditAlgorithmViewProps = Pick<
  PageProps<"/admin/algorithms/[slug]">,
  "params"
>;

export async function EditAlgorithmView({ params }: EditAlgorithmViewProps) {
  const { slug } = await params;
  const [algorithms, categories] = await Promise.all([
    getAlgorithmCatalog(),
    getCategoryCatalog(),
  ]);
  const algorithm = algorithms.find((entry) => entry.slug === slug);

  if (!algorithm) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={algorithm.name}
        description={`Thuộc danh mục ${algorithm.category.name}.`}
        breadcrumb={[
          { label: "Thuật toán", href: ADMIN_ROUTES.algorithms },
          { label: algorithm.name },
        ]}
        actions={
          <Link
            href={getAlgorithmHref(algorithm.category.slug, algorithm.slug)}
            className={getButtonClassName("secondary")}
          >
            <ExternalLink aria-hidden="true" />
            Xem trên trang web
          </Link>
        }
      />
      <AlgorithmForm
        categories={categories.map(({ id, name }) => ({ id, name }))}
        algorithm={algorithm}
        sourceCode={findSourceCode(algorithm.key)}
      />
    </>
  );
}

export function EditAlgorithmViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="h-5 w-56 rounded bg-bg-subtle" />
        <div className="h-8 w-72 max-w-full rounded-lg bg-bg-subtle" />
        <div className="h-5 w-64 max-w-full rounded bg-bg-subtle" />
      </div>
      <div className="h-80 rounded-xl bg-bg-subtle" />
      <div className="h-40 rounded-xl bg-bg-subtle" />
      <div className="h-96 rounded-xl bg-bg-subtle" />
    </div>
  );
}
