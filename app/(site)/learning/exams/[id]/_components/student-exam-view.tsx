import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireStudentUser } from "@/features/learning/auth";
import { ActionButtonForm } from "@/features/learning/components/action-button-form";
import { ExamAnswerView } from "@/features/learning/components/exam-answer-view";
import { StudentExamForm } from "@/features/learning/components/student-exam-form";
import { getStudentExamDetail } from "@/features/learning/queries";
import { getStudentClassHref } from "@/features/learning/routes";
import {
  saveSubmissionAction,
  startSubmissionAction,
} from "@/features/learning/submission-actions";
import { formatDateTime } from "@/lib/format";

function isDeadlinePassed(deadline: Date | null): boolean {
  return deadline !== null && deadline.getTime() <= Date.now();
}

export async function StudentExamView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const examId = Number(id);
  const user = await requireStudentUser();
  const exam = await getStudentExamDetail(examId, user);
  const deadlinePassed = isDeadlinePassed(exam.deadline);
  const isClosed = exam.status === "closed" || deadlinePassed;
  const canStart = !exam.submission && exam.status === "published" && !isClosed;
  const canEdit =
    exam.submission?.status === "in_progress" &&
    exam.status === "published" &&
    !isClosed;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href={getStudentClassHref(exam.classId)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {exam.className}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              {exam.title}
            </h1>
            {exam.description && (
              <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
                {exam.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isClosed ? "neutral" : "accent"}>
              {isClosed ? "Đã đóng" : "Đang mở"}
            </Badge>
            {exam.deadline && (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Clock aria-hidden="true" className="size-3.5" />
                Hạn nộp {formatDateTime(exam.deadline)}
              </span>
            )}
            <span className="text-xs text-text-secondary">
              {exam.questions.length} câu hỏi
            </span>
          </div>
        </div>
      </div>

      {!exam.submission && canStart && (
        <section className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5">
          <h2 className="text-lg font-semibold text-text-primary">
            Sẵn sàng làm bài?
          </h2>
          <p className="text-sm leading-6 text-text-secondary">
            Bài làm sẽ được lưu nháp khi bạn bấm “Lưu nháp”. Sau khi nộp, bạn
            không thể sửa lại.
          </p>
          <div>
            <ActionButtonForm
              action={startSubmissionAction}
              fields={{ examId: exam.id }}
              label="Bắt đầu làm bài"
              pendingLabel="Đang mở..."
              variant="primary"
            />
          </div>
        </section>
      )}

      {!exam.submission && !canStart && (
        <section className="rounded-xl border border-border-default bg-bg-surface p-5">
          <p className="text-sm text-text-secondary">
            Bài kiểm tra đã đóng và bạn chưa bắt đầu làm.
          </p>
        </section>
      )}

      {exam.submission && canEdit && (
        <StudentExamForm action={saveSubmissionAction} exam={exam} />
      )}

      {exam.submission && !canEdit && (
        <div className="flex flex-col gap-4">
          {exam.submission.status === "in_progress" && (
            <p className="rounded-xl border border-warning-subtle bg-warning-subtle px-4 py-3 text-sm text-warning-text">
              Bài kiểm tra đã đóng nên bạn không thể nộp tiếp. Bài làm nháp vẫn
              được hiển thị bên dưới.
            </p>
          )}
          <ExamAnswerView exam={exam} />
        </div>
      )}
    </div>
  );
}

export function StudentExamViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-8">
      <div className="h-12 w-2/3 rounded-lg bg-bg-subtle" />
      <div className="h-5 w-1/3 rounded bg-bg-subtle" />
      <div className="h-96 rounded-xl bg-bg-subtle" />
    </div>
  );
}
