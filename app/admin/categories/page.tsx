import { ExternalLink, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getButtonClassName } from "@/components/ui/button";
import { isCategorySlug } from "@/features/catalog/categories";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { getCategoryCatalog } from "@/features/catalog/queries";
import { getCategoryHref } from "@/features/catalog/routes";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber } from "@/lib/format";
import { ConfirmDeleteDialog } from "../_components/confirm-delete-dialog";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../_components/data-table";
import { EditDialog, FormDialog } from "../_components/form-dialog";
import { PageHeader } from "../_components/page-header";
import { RowActions } from "../_components/row-actions";
import { CategoryFormFields } from "./_components/category-form-fields";

export const metadata: Metadata = {
  title: "Danh mục",
};

const COLUMNS: readonly ITableColumn[] = [
  { label: "Danh mục" },
  { label: "Mô tả" },
  { label: "Thuật toán", align: "right" },
  { label: "Cập nhật" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

export default async function AdminCategoriesPage() {
  const categories = await getCategoryCatalog();

  return (
    <>
      <PageHeader
        title="Danh mục"
        description="Nhóm các thuật toán theo chủ đề. Tên và mô tả hiện ở trang chủ, menu và trang danh mục."
        breadcrumb={[{ label: "Danh mục" }]}
        actions={
          <FormDialog
            title="Thêm danh mục"
            trigger={
              <>
                <Plus aria-hidden="true" />
                Thêm danh mục
              </>
            }
            triggerClassName={getButtonClassName("primary")}
            submitLabel="Thêm danh mục"
          >
            <CategoryFormFields idPrefix="category-new" />
          </FormDialog>
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={categories.length}
        itemLabel="danh mục"
        searchPlaceholder="Tìm theo tên hoặc slug"
        emptyMessage="Chưa có danh mục nào."
      >
        {categories.map((category) => (
          <tr key={category.id} className={TABLE_ROW_CLASS_NAME}>
            <td className={TABLE_CELL_CLASS_NAME}>
              <div className="flex items-center gap-3">
                {isCategorySlug(category.slug) && (
                  <CategoryIcon slug={category.slug} size="sm" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {category.name}
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    {category.slug}
                  </span>
                </div>
              </div>
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <p className="line-clamp-2 max-w-md text-text-secondary">
                {category.description ?? "—"}
              </p>
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "text-right font-medium text-text-primary tabular-nums",
              )}
            >
              {formatNumber(category.algorithms.length)}
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary tabular-nums",
              )}
            >
              {formatDate(category.updatedAt)}
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <RowActions>
                <Link
                  href={getCategoryHref(category.slug)}
                  aria-label={`Xem danh mục ${category.name} trên trang web`}
                  className={getButtonClassName("ghost", "icon")}
                >
                  <ExternalLink aria-hidden="true" />
                </Link>
                <EditDialog entityLabel="danh mục" itemName={category.name}>
                  <CategoryFormFields
                    idPrefix={`category-${category.id}`}
                    category={category}
                  />
                </EditDialog>
                <ConfirmDeleteDialog
                  entityLabel="danh mục"
                  itemName={category.name}
                  blockedReason={
                    category.algorithms.length > 0
                      ? `Danh mục “${category.name}” đang có ${formatNumber(category.algorithms.length)} thuật toán. Hãy chuyển hoặc xoá các thuật toán đó trước.`
                      : undefined
                  }
                />
              </RowActions>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
