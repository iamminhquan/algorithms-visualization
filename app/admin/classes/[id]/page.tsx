import { ArrowRight, Pencil, Plus, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { getUserCatalog } from "@/features/auth/queries";
import { requireStaffUser } from "@/features/learning/auth";
import {
  importClassRosterAction,
  setClassStatusAction,
  updateClassAction,
} from "@/features/learning/class-actions";
import { ActionButtonForm } from "@/features/learning/components/action-button-form";
import { ClassFormDialog } from "@/features/learning/components/class-form";
import { ExamFormDialog } from "@/features/learning/components/exam-form";
import { ImportRosterForm } from "@/features/learning/components/import-roster-form";
import {
  closeExamAction,
  createExamAction,
  publishExamAction,
} from "@/features/learning/exam-actions";
import { getStaffClassDetail } from "@/features/learning/queries";
import { getAdminExamHref } from "@/features/learning/routes";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { AdminPageSkeleton } from "../../_components/admin-page-skeleton";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../../_components/data-table";
import { PageHeader } from "../../_components/page-header";
import { Panel } from "../../_components/panel";

export const metadata: Metadata = {
  title: "Chi tiết lớp học",
};

const MEMBER_COLUMNS: readonly ITableColumn[] = [
  { label: "Sinh viên" },
  { label: "MSSV" },
  { label: "Cách tham gia" },
  { label: "Ngày tham gia" },
];

const EXAM_COLUMNS: readonly ITableColumn[] = [
  { label: "Bài kiểm tra" },
  { label: "Trạng thái" },
  { label: "Hạn nộp" },
  { label: "Câu hỏi", align: "right" },
  { label: "Bài nộp", align: "right" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

const EXAM_STATUS_LABELS = {
  draft: { label: "Bản nháp", tone: "neutral" as const },
  published: { label: "Đã công bố", tone: "success" as const },
  closed: { label: "Đã đóng", tone: "warning" as const },
};

export default function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminClassDetailContent params={params} />
    </Suspense>
  );
}

async function AdminClassDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classId = Number(id);
  const user = await requireStaffUser();
  const [classRow, users] = await Promise.all([
    getStaffClassDetail(classId, user),
    getUserCatalog(),
  ]);
  const teachers = users.flatMap((candidate) =>
    candidate.role === "teacher" || candidate.role === "admin"
      ? [{ id: candidate.id, name: candidate.name }]
      : [],
  );
  const isAdmin = user.role === "admin";
  const isArchived = classRow.status === "archived";

  return (
    <>
      <PageHeader
        title={classRow.name}
        description={`Mã lớp ${classRow.code} · ${classRow.members.length}/${classRow.maxSize} sinh viên · Giảng viên ${classRow.owner.name}`}
        breadcrumb={[
          { label: "Lớp học", href: "/admin/classes" },
          { label: classRow.name },
        ]}
        actions={
          <>
            <ClassFormDialog
              action={updateClassAction}
              title="Sửa lớp học"
              description={classRow.name}
              trigger={
                <>
                  <Pencil aria-hidden="true" />
                  Sửa lớp
                </>
              }
              triggerClassName={getButtonClassName("secondary")}
              submitLabel="Lưu thay đổi"
              idPrefix={`class-detail-${classRow.id}`}
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
              label={isArchived ? "Mở lại lớp" : "Lưu trữ lớp"}
              confirmMessage={
                isArchived ? undefined : `Lưu trữ lớp "${classRow.name}"?`
              }
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Mã lớp" value={classRow.code} isMono />
        <InfoCard
          label="Sĩ số"
          value={`${formatNumber(classRow.members.length)} / ${formatNumber(classRow.maxSize)}`}
        />
        <InfoCard
          label="Sĩ số tối thiểu"
          value={formatNumber(classRow.minSize)}
        />
        <InfoCard
          label="Trạng thái"
          value={isArchived ? "Đã lưu trữ" : "Đang hoạt động"}
        />
      </div>

      <Panel
        title="Sinh viên trong lớp"
        description="Import danh sách từ Excel hoặc để sinh viên tự tham gia bằng mã lớp."
        actions={
          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
            <Upload aria-hidden="true" className="size-4" />
            Import Excel
          </span>
        }
      >
        <div className="border-b border-border-default">
          <ImportRosterForm
            action={importClassRosterAction}
            classId={classRow.id}
          />
        </div>
        <DataTable
          columns={MEMBER_COLUMNS}
          rowCount={classRow.members.length}
          itemLabel="sinh viên"
          searchPlaceholder="Tìm theo tên hoặc email"
          emptyMessage="Lớp chưa có sinh viên."
        >
          {classRow.members.map((member) => (
            <tr key={member.id} className={TABLE_ROW_CLASS_NAME}>
              <td className={TABLE_CELL_CLASS_NAME}>
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {member.user.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {member.user.email}
                  </span>
                </div>
              </td>
              <td
                className={cn(
                  TABLE_CELL_CLASS_NAME,
                  "font-mono text-text-secondary",
                )}
              >
                {member.studentCode ?? "—"}
              </td>
              <td className={cn(TABLE_CELL_CLASS_NAME, "text-text-secondary")}>
                {member.joinMethod === "excel_import"
                  ? "Import Excel"
                  : "Mã lớp"}
              </td>
              <td className={cn(TABLE_CELL_CLASS_NAME, "text-text-secondary")}>
                {formatDate(member.createdAt)}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel
        title="Bài kiểm tra"
        description="Bài kiểm tra thuộc lớp này và được giao cho toàn bộ sinh viên."
        actions={
          <ExamFormDialog
            action={createExamAction}
            title="Tạo bài kiểm tra"
            trigger={
              <>
                <Plus aria-hidden="true" />
                Tạo bài kiểm tra
              </>
            }
            triggerClassName={getButtonClassName("primary", "sm")}
            submitLabel="Tạo bài kiểm tra"
            idPrefix={`exam-new-${classRow.id}`}
            initialValues={{
              classId: classRow.id,
              title: "",
              description: "",
              deadline: null,
            }}
          />
        }
      >
        <DataTable
          columns={EXAM_COLUMNS}
          rowCount={classRow.exams.length}
          itemLabel="bài kiểm tra"
          searchPlaceholder="Tìm theo tiêu đề"
          emptyMessage="Lớp chưa có bài kiểm tra."
        >
          {classRow.exams.map((exam) => {
            const status = EXAM_STATUS_LABELS[exam.status];
            return (
              <tr key={exam.id} className={TABLE_ROW_CLASS_NAME}>
                <td className={TABLE_CELL_CLASS_NAME}>
                  <Link
                    href={getAdminExamHref(classRow.id, exam.id)}
                    className="font-medium text-text-primary hover:text-accent-text"
                  >
                    {exam.title}
                  </Link>
                </td>
                <td className={TABLE_CELL_CLASS_NAME}>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td
                  className={cn(
                    TABLE_CELL_CLASS_NAME,
                    "whitespace-nowrap text-text-secondary",
                  )}
                >
                  {exam.deadline ? formatDateTime(exam.deadline) : "Không có"}
                </td>
                <td
                  className={cn(
                    TABLE_CELL_CLASS_NAME,
                    "text-right tabular-nums text-text-secondary",
                  )}
                >
                  {formatNumber(exam.examQuestions.length)}
                </td>
                <td
                  className={cn(
                    TABLE_CELL_CLASS_NAME,
                    "text-right tabular-nums text-text-secondary",
                  )}
                >
                  {formatNumber(exam.submissions.length)}
                </td>
                <td className={TABLE_CELL_CLASS_NAME}>
                  <div className="flex flex-wrap items-start justify-end gap-1">
                    <Link
                      href={getAdminExamHref(classRow.id, exam.id)}
                      aria-label={`Mở bài kiểm tra ${exam.title}`}
                      className={getButtonClassName("ghost", "icon")}
                    >
                      <ArrowRight aria-hidden="true" />
                    </Link>
                    {exam.status === "draft" && (
                      <ActionButtonForm
                        action={publishExamAction}
                        fields={{ examId: exam.id }}
                        label="Công bố"
                        variant="primary"
                        confirmMessage={`Công bố bài "${exam.title}"?`}
                      />
                    )}
                    {exam.status === "published" && (
                      <ActionButtonForm
                        action={closeExamAction}
                        fields={{ examId: exam.id }}
                        label="Đóng"
                        confirmMessage={`Đóng bài "${exam.title}"?`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </Panel>

      <Panel
        title="Lịch sử import"
        description="Các lần upload danh sách sinh viên gần đây."
      >
        {classRow.importJobs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-secondary">
            Chưa có lần import nào.
          </p>
        ) : (
          <ul className="divide-y divide-border-default">
            {classRow.importJobs.slice(0, 10).map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-text-primary">
                    {job.fileName}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatDate(job.createdAt)} · {job.successRows} thành công ·{" "}
                    {job.failedRows} lỗi
                  </span>
                </div>
                <Badge
                  tone={
                    job.status === "done"
                      ? "success"
                      : job.status === "failed"
                        ? "danger"
                        : "neutral"
                  }
                >
                  {job.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function InfoCard({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: string;
  isMono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border-default bg-bg-surface p-4">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span
        className={cn(
          "text-lg font-semibold text-text-primary",
          isMono && "font-mono",
        )}
      >
        {value}
      </span>
    </div>
  );
}
