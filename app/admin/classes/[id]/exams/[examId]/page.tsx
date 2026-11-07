import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { requireStaffUser } from "@/features/learning/auth";
import { ActionButtonForm } from "@/features/learning/components/action-button-form";
import { AddExamQuestionForm } from "@/features/learning/components/add-exam-question-form";
import { ExamFormDialog } from "@/features/learning/components/exam-form";
import {
  addExamQuestionAction,
  closeExamAction,
  deleteExamAction,
  publishExamAction,
  removeExamQuestionAction,
  updateExamAction,
} from "@/features/learning/exam-actions";
import {
  getQuestionBank,
  getStaffExamDetail,
} from "@/features/learning/queries";
import { getAdminClassHref } from "@/features/learning/routes";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { AdminPageSkeleton } from "../../../../_components/admin-page-skeleton";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../../../../_components/data-table";
import { PageHeader } from "../../../../_components/page-header";
import { Panel } from "../../../../_components/panel";

export const metadata: Metadata = {
  title: "Chi tiết bài kiểm tra",
};

const EXAM_STATUS_LABELS = {
  draft: { label: "Bản nháp", tone: "neutral" as const },
  published: { label: "Đã công bố", tone: "success" as const },
  closed: { label: "Đã đóng", tone: "warning" as const },
};

const SUBMISSION_COLUMNS: readonly ITableColumn[] = [
  { label: "Sinh viên" },
  { label: "Trạng thái" },
  { label: "Điểm", align: "right" },
  { label: "Nộp lúc" },
];

export default function AdminExamDetailPage({
  params,
}: {
  params: Promise<{ id: string; examId: string }>;
}) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminExamDetailContent params={params} />
    </Suspense>
  );
}

async function AdminExamDetailContent({
  params,
}: {
  params: Promise<{ id: string; examId: string }>;
}) {
  const { examId } = await params;
  const numericExamId = Number(examId);
  const user = await requireStaffUser();
  const [exam, questionBank] = await Promise.all([
    getStaffExamDetail(numericExamId, user),
    getQuestionBank(user),
  ]);
  const status = EXAM_STATUS_LABELS[exam.status];
  const maxScore = exam.examQuestions.reduce(
    (total, examQuestion) => total + examQuestion.points,
    0,
  );
  const availableQuestions = questionBank
    .filter(
      (question) =>
        !question.examQuestions.some((item) => item.exam.id === numericExamId),
    )
    .map((question) => ({
      id: question.id,
      content: question.content,
      type: question.type,
    }));
  const isDraft = exam.status === "draft";

  return (
    <>
      <PageHeader
        title={exam.title}
        breadcrumb={[
          { label: "Lớp học", href: "/admin/classes" },
          {
            label: exam.class.name,
            href: getAdminClassHref(exam.classId),
          },
          { label: exam.title },
        ]}
        actions={
          <>
            <Link
              href={getAdminClassHref(exam.classId)}
              className={getButtonClassName("secondary")}
            >
              <ArrowLeft aria-hidden="true" />
              Về lớp
            </Link>
            <ExamFormDialog
              action={updateExamAction}
              title="Sửa bài kiểm tra"
              description={exam.title}
              trigger={
                <>
                  <Pencil aria-hidden="true" />
                  Sửa
                </>
              }
              triggerClassName={getButtonClassName("secondary")}
              submitLabel="Lưu thay đổi"
              idPrefix={`exam-${exam.id}`}
              initialValues={{
                id: exam.id,
                classId: exam.classId,
                title: exam.title,
                description: exam.description ?? "",
                deadline: exam.deadline?.toISOString() ?? null,
              }}
            />
            {isDraft && (
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
                label="Đóng bài"
                confirmMessage={`Đóng bài "${exam.title}"?`}
              />
            )}
            {exam.submissions.length === 0 && (
              <ActionButtonForm
                action={deleteExamAction}
                fields={{ examId: exam.id }}
                label="Xoá"
                variant="danger"
                confirmMessage={`Xoá bài "${exam.title}"?`}
              />
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Trạng thái" value={status.label} />
        <InfoCard
          label="Hạn nộp"
          value={exam.deadline ? formatDateTime(exam.deadline) : "Không có"}
        />
        <InfoCard label="Tổng điểm" value={`${maxScore} điểm`} />
        <InfoCard
          label="Bài đã nộp"
          value={`${exam.submissions.filter((submission) => submission.status === "submitted").length}/${exam.submissions.length}`}
        />
      </div>

      <Panel
        title="Câu hỏi"
        actions={<Badge tone={status.tone}>{status.label}</Badge>}
      >
        {exam.examQuestions.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-secondary">
            Bài kiểm tra chưa có câu hỏi.
          </p>
        ) : (
          <ul className="divide-y divide-border-default">
            {exam.examQuestions.map((examQuestion, index) => (
              <li
                key={examQuestion.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-xs font-medium text-text-muted">
                    Câu {index + 1}
                  </span>
                  <p className="truncate text-sm text-text-primary">
                    {examQuestion.question.content}
                  </p>
                </div>
                {isDraft && (
                  <ActionButtonForm
                    action={removeExamQuestionAction}
                    fields={{
                      examId: exam.id,
                      examQuestionId: examQuestion.id,
                    }}
                    label="Bỏ"
                    variant="ghost"
                    confirmMessage="Bỏ câu hỏi này khỏi bài kiểm tra?"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        {isDraft && (
          <div className="border-t border-border-default">
            <AddExamQuestionForm
              action={addExamQuestionAction}
              examId={exam.id}
              questions={availableQuestions}
            />
          </div>
        )}
      </Panel>

      <Panel title="Bài nộp">
        <DataTable
          isEmbedded
          isFooterHidden
          columns={SUBMISSION_COLUMNS}
          rowCount={exam.submissions.length}
          itemLabel="bài nộp"
          searchPlaceholder="Tìm theo tên sinh viên"
          emptyMessage="Chưa có sinh viên nộp bài."
        >
          {exam.submissions.map((submission) => (
            <tr key={submission.id} className={TABLE_ROW_CLASS_NAME}>
              <td className={TABLE_CELL_CLASS_NAME}>
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {submission.student.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {submission.student.email}
                  </span>
                </div>
              </td>
              <td className={TABLE_CELL_CLASS_NAME}>
                <Badge
                  tone={
                    submission.status === "submitted" ? "success" : "warning"
                  }
                >
                  {submission.status === "submitted" ? "Đã nộp" : "Đang làm"}
                </Badge>
              </td>
              <td
                className={cn(
                  TABLE_CELL_CLASS_NAME,
                  "text-right font-medium text-text-primary tabular-nums",
                )}
              >
                {submission.score ?? "—"}
              </td>
              <td
                className={cn(
                  TABLE_CELL_CLASS_NAME,
                  "whitespace-nowrap text-text-secondary",
                )}
              >
                {submission.submittedAt
                  ? formatDateTime(submission.submittedAt)
                  : "—"}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border-default bg-bg-surface p-4">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className="text-lg font-semibold text-text-primary">{value}</span>
    </div>
  );
}
