import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getLearningUser } from "@/features/learning/auth";
import { getStudentClasses } from "@/features/learning/queries";
import {
  getStudentExamHref,
  STUDENT_CLASSES_PATH,
} from "@/features/learning/routes";
import { formatDate } from "@/lib/format";

function getExamStatus(
  submission: { status: string; score: number | null } | undefined,
  exam: { status: string; deadline: Date | null },
) {
  if (submission?.status === "submitted") {
    return {
      label: "Đã nộp",
      tone: "success" as const,
      score: submission.score,
    };
  }
  const isClosed =
    exam.status === "closed" ||
    (exam.deadline !== null && exam.deadline.getTime() <= Date.now());
  if (isClosed) {
    return { label: "Đã đóng", tone: "neutral" as const, score: null };
  }
  if (submission) {
    return { label: "Đang làm", tone: "accent" as const, score: null };
  }
  return { label: "Chưa làm", tone: "warning" as const, score: null };
}

export async function LearningStatusSection() {
  const user = await getLearningUser();
  if (!user || user.role !== "student") return null;

  const memberships = await getStudentClasses(user);
  const exams = memberships.flatMap((membership) =>
    membership.class.exams.map((exam) => ({
      className: membership.class.name,
      exam,
      submission: exam.submissions[0],
    })),
  );
  const submittedCount = exams.filter(
    ({ submission, exam }) =>
      getExamStatus(submission, exam).label === "Đã nộp",
  ).length;
  const inProgressCount = exams.filter(
    ({ submission, exam }) =>
      getExamStatus(submission, exam).label === "Đang làm",
  ).length;
  const notStartedCount = exams.filter(
    ({ submission, exam }) =>
      getExamStatus(submission, exam).label === "Chưa làm",
  ).length;
  const recentExams = exams.slice(0, 5);

  return (
    <section
      aria-labelledby="learning-status-title"
      className="flex flex-col gap-5 rounded-2xl border border-border-default bg-bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="learning-status-title"
            className="text-lg font-semibold text-text-primary"
          >
            Tình trạng học tập
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Tiến độ lớp học và bài kiểm tra của bạn.
          </p>
        </div>
        <Link
          href={STUDENT_CLASSES_PATH}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-text hover:underline"
        >
          Xem lớp học <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatusCount label="Lớp đã tham gia" value={memberships.length} />
        <StatusCount label="Bài đã nộp" value={submittedCount} />
        <StatusCount label="Đang làm" value={inProgressCount} />
        <StatusCount label="Chưa làm" value={notStartedCount} />
      </dl>

      {recentExams.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong px-5 py-8 text-center">
          <BookOpen aria-hidden="true" className="size-5 text-text-muted" />
          <p className="text-sm text-text-secondary">
            Chưa có bài kiểm tra nào trong các lớp của bạn.
          </p>
          <Link
            href={STUDENT_CLASSES_PATH}
            className="text-sm font-medium text-accent-text hover:underline"
          >
            Mở danh sách lớp học
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border-default rounded-xl border border-border-default">
          {recentExams.map(({ className, exam, submission }) => {
            const status = getExamStatus(submission, exam);
            return (
              <li key={exam.id}>
                <Link
                  href={getStudentExamHref(exam.id)}
                  className="flex flex-col gap-2 p-4 transition-colors hover:bg-bg-subtle/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text-primary">
                      {exam.title}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {className}
                      {exam.deadline
                        ? ` · Hạn ${formatDate(exam.deadline)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {status.score !== null && (
                      <span className="text-sm text-text-secondary">
                        Điểm: {status.score}
                      </span>
                    )}
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StatusCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-bg-subtle p-3">
      <dt className="text-xs leading-5 text-text-secondary">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </dd>
    </div>
  );
}
