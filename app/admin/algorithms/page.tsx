import { ExternalLink, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getButtonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AlgorithmIcon } from "@/features/catalog/components/algorithm-icon";
import {
  getAlgorithmCatalog,
  getCategoryCatalog,
} from "@/features/catalog/queries";
import { getAlgorithmHref } from "@/features/catalog/routes";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import {
  ADMIN_ROUTES,
  getAdminAlgorithmHref,
} from "../_components/admin-routes";
import { ConfirmDeleteDialog } from "../_components/confirm-delete-dialog";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../_components/data-table";
import { PageHeader } from "../_components/page-header";
import { RowActions } from "../_components/row-actions";

export const metadata: Metadata = {
  title: "Thuật toán",
};

const COLUMNS: readonly ITableColumn[] = [
  { label: "Thuật toán" },
  { label: "Danh mục" },
  { label: "Thời gian" },
  { label: "Bộ nhớ" },
  { label: "Cập nhật" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

export default async function AdminAlgorithmsPage() {
  const [algorithms, categories] = await Promise.all([
    getAlgorithmCatalog(),
    getCategoryCatalog(),
  ]);

  return (
    <>
      <PageHeader
        title="Thuật toán"
        description="Thông tin, độ phức tạp và mã nguồn của các thuật toán đã có trình mô phỏng."
        breadcrumb={[{ label: "Thuật toán" }]}
        actions={
          <Link
            href={ADMIN_ROUTES.newAlgorithm}
            className={getButtonClassName("primary")}
          >
            <Plus aria-hidden="true" />
            Thêm thuật toán
          </Link>
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={algorithms.length}
        itemLabel="thuật toán"
        searchPlaceholder="Tìm theo tên hoặc key"
        emptyMessage="Chưa có thuật toán nào."
        filters={
          <Select
            aria-label="Lọc theo danh mục"
            defaultValue=""
            className="w-full sm:w-52"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        }
      >
        {algorithms.map((algorithm) => (
          <tr key={algorithm.id} className={TABLE_ROW_CLASS_NAME}>
            <td className={TABLE_CELL_CLASS_NAME}>
              <div className="flex items-center gap-3">
                <AlgorithmIcon algorithmKey={algorithm.key} size="sm" />
                <div className="flex flex-col">
                  <Link
                    href={getAdminAlgorithmHref(algorithm.slug)}
                    className="rounded-sm font-medium text-text-primary transition-colors hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
                  >
                    {algorithm.name}
                  </Link>
                  <span className="font-mono text-xs text-text-muted">
                    {algorithm.key}
                  </span>
                </div>
              </div>
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary",
              )}
            >
              {algorithm.category.name}
            </td>
            <td className={cn(TABLE_CELL_CLASS_NAME, "font-mono text-xs")}>
              {algorithm.timeComplexity ?? "—"}
            </td>
            <td className={cn(TABLE_CELL_CLASS_NAME, "font-mono text-xs")}>
              {algorithm.spaceComplexity ?? "—"}
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary tabular-nums",
              )}
            >
              {formatDate(algorithm.updatedAt)}
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <RowActions>
                <Link
                  href={getAlgorithmHref(
                    algorithm.category.slug,
                    algorithm.slug,
                  )}
                  aria-label={`Xem ${algorithm.name} trên trang web`}
                  className={getButtonClassName("ghost", "icon")}
                >
                  <ExternalLink aria-hidden="true" />
                </Link>
                <Link
                  href={getAdminAlgorithmHref(algorithm.slug)}
                  aria-label={`Sửa thuật toán ${algorithm.name}`}
                  className={getButtonClassName("ghost", "icon")}
                >
                  <Pencil aria-hidden="true" />
                </Link>
                <ConfirmDeleteDialog
                  entityLabel="thuật toán"
                  itemName={algorithm.name}
                />
              </RowActions>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
