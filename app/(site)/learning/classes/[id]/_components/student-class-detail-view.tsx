import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { requireStudentUser } from "@/features/learning/auth";
import { getStudentClassDetail } from "@/features/learning/queries";
import {
  getStudentExamHref,
  STUDENT_CLASSES_PATH,
} from "@/features/learning/routes";
import { cn } from "@/lib/cn";

function isDeadlinePassed(deadline: Date | null): boolean {
  return deadline !== null && deadline.getTime() <= Date.now();
}

export async function StudentClassDetailView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classId = Number(id);
  const user = await requireStudentUser();
  const classRow = await getStudentClassDetail(classId, user);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href={STUDENT_CLASSES_PATH}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Lớp học của tôi
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              {classRow.name}
            </h1>
            <p className="text-lg text-text-secondary">
              Giảng viên {classRow.owner.name}
            </p>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          Bài kiểm tra
        </h2>
        {classRow.exams.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-surface px-6 py-12 text-center">
            <BookOpen aria-hidden="true" className="size-6 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Lớp chưa có bài kiểm tra nào.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {classRow.exams.map((exam) => {
              const submission = exam.submissions[0];
              const deadlinePassed = isDeadlinePassed(exam.deadline);
              const isClosed = exam.status === "closed" || deadlinePassed;
              const actionLabel = submission
                ? submission.status === "submitted"
                  ? "Xem bài làm"
                  : isClosed
                    ? "Xem bài đã lưu"
                    : "Tiếp tục làm"
                : isClosed
                  ? "Xem đề"
                  : "Làm bài";

              return (
                <li key={exam.id}>
                  <Link
                    href={getStudentExamHref(exam.id)}
                    className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5 transition-colors hover:border-border-strong hover:bg-bg-subtle/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-text-primary">
                          {exam.title}
                        </h3>
                        <Badge
                          tone={
                            submission?.status === "submitted"
                              ? "success"
                              : isClosed
                                ? "neutral"
                                : "accent"
                          }
                        >
                          {submission?.status === "submitted"
                            ? "Đã nộp"
                            : submission
                              ? "Đang làm"
                              : isClosed
                                ? "Đã đóng"
                                : "Chưa làm"}
                        </Badge>
                      </div>
                      {submission?.status === "submitted" && (
                        <p className="text-sm text-text-secondary">
                          Điểm:{" "}
                          <strong className="text-text-primary">
                            {submission.score ?? 0}
                          </strong>
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        getButtonClassName("secondary", "sm"),
                        "self-start sm:self-auto",
                      )}
                    >
                      {actionLabel}
                      <ArrowRight aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export function StudentClassDetailViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-8">
      <div className="h-12 w-2/3 rounded-lg bg-bg-subtle" />
      <div className="h-5 w-1/3 rounded bg-bg-subtle" />
      <div className="h-56 rounded-xl bg-bg-subtle" />
    </div>
  );
}
