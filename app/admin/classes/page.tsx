import { ArrowRight, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { getUserCatalog } from "@/features/auth/queries";
import { requireStaffUser } from "@/features/learning/auth";
import {
  createClassAction,
  deleteClassAction,
  setClassStatusAction,
  updateClassAction,
} from "@/features/learning/class-actions";
import { ActionButtonForm } from "@/features/learning/components/action-button-form";
import { ClassFormDialog } from "@/features/learning/components/class-form";
import { getStaffClasses } from "@/features/learning/queries";
import { getAdminClassHref } from "@/features/learning/routes";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber } from "@/lib/format";
import { AdminPageSkeleton } from "../_components/admin-page-skeleton";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../_components/data-table";
import { PageHeader } from "../_components/page-header";

export const metadata: Metadata = {
  title: "Lớp học",
};

const COLUMNS: readonly ITableColumn[] = [
  { label: "Lớp học" },
  { label: "Giảng viên" },
  { label: "Sinh viên", align: "right" },
  { label: "Bài kiểm tra", align: "right" },
  { label: "Trạng thái" },
  { label: "Ngày tạo" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

export default function AdminClassesPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminClassesContent />
    </Suspense>
  );
}

async function AdminClassesContent() {
  const user = await requireStaffUser();
  const [classes, users] = await Promise.all([
    getStaffClasses(user),
    getUserCatalog(),
  ]);
  const teachers = users.flatMap((candidate) =>
    candidate.role === "teacher" || candidate.role === "admin"
      ? [{ id: candidate.id, name: candidate.name }]
      : [],
  );
  const isAdmin = user.role === "admin";

  return (
    <>
      <PageHeader
        title="Lớp học"
        description="Quản lý lớp, mã tham gia, danh sách sinh viên và bài kiểm tra."
        breadcrumb={[{ label: "Lớp học" }]}
        actions={
          <ClassFormDialog
            action={createClassAction}
            title="Mở lớp học"
            description="Hệ thống sẽ tạo mã lớp tự động sau khi lưu."
            trigger={
              <>
                <Plus aria-hidden="true" />
                Mở lớp học
              </>
            }
            triggerClassName={getButtonClassName("primary")}
            submitLabel="Mở lớp"
            idPrefix="class-new"
            teachers={teachers}
            isAdmin={isAdmin}
          />
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={classes.length}
        itemLabel="lớp học"
        searchPlaceholder="Tìm theo tên hoặc mã lớp"
        emptyMessage="Chưa có lớp học nào."
      >
        {classes.map((classRow) => {
          const isArchived = classRow.status === "archived";
          return (
            <tr key={classRow.id} className={TABLE_ROW_CLASS_NAME}>
              <td className={TABLE_CELL_CLASS_NAME}>
                <div className="flex flex-col">
                  <Link
                    href={getAdminClassHref(classRow.id)}
                    className="font-medium text-text-primary hover:text-accent-text"
                  >
                    {classRow.name}
                  </Link>
                  <span className="font-mono text-xs text-text-muted">
                    {classRow.code}
                  </span>
                </div>
              </td>
              <td className={cn(TABLE_CELL_CLASS_NAME, "text-text-secondary")}>
                {classRow.owner.name}
              </td>
              <td
                className={cn(
                  TABLE_CELL_CLASS_NAME,
                  "text-right font-medium text-text-primary tabular-nums",
                )}
              >
                {formatNumber(classRow.members.length)}
              </td>
              <td
                className={cn(
                  TABLE_CELL_CLASS_NAME,
                  "text-right text-text-secondary tabular-nums",
                )}
              >
                {formatNumber(classRow.exams.length)}
              </td>
              <td className={TABLE_CELL_CLASS_NAME}>
                <Badge tone={isArchived ? "neutral" : "success"}>
                  {isArchived ? "Đã lưu trữ" : "Đang hoạt động"}
                </Badge>
              </td>
              <td
                className={cn(
                  TABLE_CELL_CLASS_NAME,
                  "whitespace-nowrap text-text-secondary tabular-nums",
                )}
              >
                {formatDate(classRow.createdAt)}
              </td>
              <td className={TABLE_CELL_CLASS_NAME}>
                <div className="flex flex-wrap items-start justify-end gap-1">
                  <Link
                    href={getAdminClassHref(classRow.id)}
                    aria-label={`Mở lớp ${classRow.name}`}
                    className={getButtonClassName("ghost", "icon")}
                  >
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  <ClassFormDialog
                    action={updateClassAction}
                    title="Sửa lớp học"
                    description={classRow.name}
                    trigger={<Pencil aria-hidden="true" />}
                    triggerLabel={`Sửa lớp ${classRow.name}`}
                    triggerClassName={getButtonClassName("ghost", "icon")}
                    submitLabel="Lưu thay đổi"
                    idPrefix={`class-${classRow.id}`}
                    teachers={teachers}
                    isAdmin={isAdmin}
                    classId={classRow.id}
                    initialValues={{
                      name: classRow.name,
                      minSize: classRow.minSize,
                      maxSize: classRow.maxSize,
                      ownerId: classRow.ownerId,
                    }}
                  />
                  <ActionButtonForm
                    action={setClassStatusAction}
                    fields={{
                      classId: classRow.id,
                      status: isArchived ? "active" : "archived",
                    }}
                    label={isArchived ? "Mở lại" : "Lưu trữ"}
                    confirmMessage={
                      isArchived ? undefined : `Lưu trữ lớp "${classRow.name}"?`
                    }
                  />
                  {classRow.exams.length === 0 && (
                    <ActionButtonForm
                      action={deleteClassAction}
                      fields={{ classId: classRow.id }}
                      label="Xoá"
                      variant="danger"
                      confirmMessage={`Xoá lớp "${classRow.name}"?`}
                    />
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
