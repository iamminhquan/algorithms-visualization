import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { getButtonClassName } from "@/components/ui/button";
import { ErrorScreen } from "@/components/ui/error-screen";
import { getLoginHref } from "@/features/auth/routes";
import { getLearningUser } from "@/features/learning/auth";
import { getStudentJoinPreview } from "@/features/learning/queries";
import {
  getStudentClassHref,
  getStudentJoinHref,
  STUDENT_CLASSES_PATH,
} from "@/features/learning/routes";
import {
  CLASS_CODE_PATTERN,
  normalizeClassCode,
} from "@/features/learning/validation";
import { JoinClassConfirmForm } from "./join-class-confirm-form";

type JoinClassViewProps = {
  params: Promise<{ code: string }>;
};

export async function JoinClassView({ params }: JoinClassViewProps) {
  const { code: rawCode } = await params;
  const code = normalizeClassCode(decodeURIComponent(rawCode));
  const user = await getLearningUser();

  if (!user) {
    redirect(getLoginHref(getStudentJoinHref(code)));
  }
  if (user.role !== "student") {
    forbidden();
  }

  if (!CLASS_CODE_PATTERN.test(code)) {
    return (
      <ErrorScreen
        code="Lỗi"
        message="Mã lớp không hợp lệ. Hãy kiểm tra lại liên kết hoặc mã được cung cấp."
      />
    );
  }

  const classRow = await getStudentJoinPreview(code, user);

  if (!classRow) {
    return (
      <ErrorScreen
        code="404"
        message="Không tìm thấy lớp học với mã này. Hãy hỏi lại giảng viên để nhận mã đúng."
      />
    );
  }

  if (classRow.status === "archived") {
    return (
      <ErrorScreen
        code="Lỗi"
        message={`Lớp "${classRow.name}" đã được lưu trữ, không thể tham gia.`}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Link
        href={STUDENT_CLASSES_PATH}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Lớp học của tôi
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Tham gia lớp học
        </h1>
        <p className="text-base text-text-secondary">
          Xác nhận lớp bạn được mời tham gia qua liên kết.
        </p>
      </header>
      <section className="flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">
            Lớp học
          </span>
          <strong className="text-lg font-semibold text-text-primary">
            {classRow.name}
          </strong>
        </div>
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          Mã lớp:
          <code className="font-mono text-sm font-semibold text-text-primary">
            {code}
          </code>
        </div>
        {classRow.members.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary">
              Bạn đã tham gia lớp này rồi.
            </p>
            <Link
              href={getStudentClassHref(classRow.id)}
              className={getButtonClassName("secondary", "sm", "self-start")}
            >
              Xem lớp học
            </Link>
          </div>
        ) : (
          <JoinClassConfirmForm code={code} />
        )}
      </section>
    </div>
  );
}

export function JoinClassViewSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-md animate-pulse flex-col gap-6"
    >
      <div className="h-5 w-36 rounded bg-bg-subtle" />
      <div className="h-9 w-2/3 rounded-lg bg-bg-subtle" />
      <div className="h-56 rounded-xl bg-bg-subtle" />
    </div>
  );
}
