import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { requireStaffUser } from "@/features/learning/auth";
import { ActionButtonForm } from "@/features/learning/components/action-button-form";
import { ImportQuestionsDialog } from "@/features/learning/components/import-questions-dialog";
import { QuestionFormDialog } from "@/features/learning/components/question-form";
import { getQuestionBank } from "@/features/learning/queries";
import {
  createQuestionAction,
  deleteQuestionAction,
  importQuestionsAction,
  updateQuestionAction,
} from "@/features/learning/question-actions";
import type { IQuestionFormValues } from "@/features/learning/types";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { AdminPageSkeleton } from "../_components/admin-page-skeleton";
import {
  DataTable,
  type ITableColumn,
  TABLE_CELL_CLASS_NAME,
  TABLE_ROW_CLASS_NAME,
} from "../_components/data-table";
import { PageHeader } from "../_components/page-header";

export const metadata: Metadata = {
  title: "Ngân hàng câu hỏi",
};

const COLUMNS: readonly ITableColumn[] = [
  { label: "Câu hỏi" },
  { label: "Đáp án" },
  { label: "Dùng trong", align: "right" },
  { label: "Cập nhật" },
  { label: "Thao tác", align: "right", isLabelHidden: true },
];

function toFormValues(
  question: Awaited<ReturnType<typeof getQuestionBank>>[number],
): IQuestionFormValues {
  return {
    id: question.id,
    type: question.type,
    content: question.content,
    allowMultiple: question.allowMultiple,
    options: question.options.map((option) => ({
      content: option.content,
      isCorrect: option.isCorrect,
    })),
    answerKeys: question.answerKeys.map((key) => ({
      blankIndex: key.blankIndex,
      acceptedValue: key.acceptedValue,
      matchMode: key.matchMode,
    })),
  };
}

export default function AdminQuestionsPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminQuestionsContent />
    </Suspense>
  );
}

async function AdminQuestionsContent() {
  const user = await requireStaffUser();
  const questions = await getQuestionBank(user);

  return (
    <>
      <PageHeader
        title="Ngân hàng câu hỏi"
        description="Câu hỏi dùng chung cho nhiều lớp và nhiều bài kiểm tra. Điểm và thứ tự được đặt riêng trong từng đề."
        breadcrumb={[{ label: "Ngân hàng câu hỏi" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ImportQuestionsDialog action={importQuestionsAction} />
            <QuestionFormDialog
              action={createQuestionAction}
              title="Thêm câu hỏi"
              trigger={
                <>
                  <Plus aria-hidden="true" />
                  Thêm câu hỏi
                </>
              }
              triggerClassName={getButtonClassName("primary")}
              submitLabel="Thêm câu hỏi"
              idPrefix="question-new"
            />
          </div>
        }
      />
      <DataTable
        columns={COLUMNS}
        rowCount={questions.length}
        itemLabel="câu hỏi"
        searchPlaceholder="Tìm theo nội dung câu hỏi"
        emptyMessage="Ngân hàng câu hỏi đang trống."
      >
        {questions.map((question) => (
          <tr key={question.id} className={TABLE_ROW_CLASS_NAME}>
            <td className={TABLE_CELL_CLASS_NAME}>
              <p className="line-clamp-2 max-w-120 text-text-primary">
                {question.content}
              </p>
            </td>
            <td className={cn(TABLE_CELL_CLASS_NAME, "text-text-secondary")}>
              {question.type === "multiple_choice"
                ? `${question.options.length} lựa chọn · ${question.options.filter((option) => option.isCorrect).length} đúng`
                : `${question.answerKeys.length} đáp án chấp nhận`}
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "text-right tabular-nums text-text-secondary",
              )}
            >
              {question.examQuestions.length}
            </td>
            <td
              className={cn(
                TABLE_CELL_CLASS_NAME,
                "whitespace-nowrap text-text-secondary",
              )}
            >
              {formatDate(question.updatedAt)}
            </td>
            <td className={TABLE_CELL_CLASS_NAME}>
              <div className="flex flex-wrap items-start justify-end gap-1">
                <QuestionFormDialog
                  action={updateQuestionAction}
                  title="Sửa câu hỏi"
                  description={question.content}
                  trigger={<Pencil aria-hidden="true" />}
                  triggerLabel={`Sửa câu hỏi ${question.id}`}
                  triggerClassName={getButtonClassName("ghost", "icon")}
                  submitLabel="Lưu thay đổi"
                  idPrefix={`question-${question.id}`}
                  initialValues={toFormValues(question)}
                />
                {question.examQuestions.length === 0 && (
                  <ActionButtonForm
                    action={deleteQuestionAction}
                    fields={{ questionId: question.id }}
                    label="Xoá"
                    variant="danger"
                    confirmMessage="Xoá câu hỏi này khỏi ngân hàng?"
                  />
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
