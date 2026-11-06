import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { requireLearningUser } from "@/features/learning/auth";
import { joinClassAction } from "@/features/learning/class-actions";
import { JoinClassForm } from "@/features/learning/components/join-class-form";
import { getStudentClasses } from "@/features/learning/queries";
import { getStudentClassHref } from "@/features/learning/routes";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

export async function StudentClassesView() {
  const user = await requireLearningUser();

  if (user.role !== "student") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border-default bg-bg-surface p-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Khu vực lớp học
        </h1>
        <p className="text-sm leading-6 text-text-secondary">
          Trang này dành cho sinh viên. Giảng viên và quản trị viên quản lý lớp
          tại trang quản trị.
        </p>
        <Link
          href="/admin/classes"
          className={getButtonClassName("primary", "sm", "self-start")}
        >
          Đến trang quản trị
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const memberships = await getStudentClasses(user);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Lớp học của tôi
        </h1>
        <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
          Tham gia lớp bằng mã giảng viên cung cấp, làm bài kiểm tra và xem
          điểm.
        </p>
      </header>

      <JoinClassForm action={joinClassAction} />

      {memberships.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-bg-surface px-6 py-14 text-center">
          <BookOpen aria-hidden="true" className="size-7 text-text-muted" />
          <p className="font-medium text-text-primary">
            Bạn chưa tham gia lớp học nào.
          </p>
          <p className="max-w-md text-sm text-text-secondary">
            Nhập mã lớp ở phía trên để bắt đầu.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {memberships.map((membership) => {
            const classRow = membership.class;
            const isArchived = classRow.status === "archived";
            return (
              <li key={membership.id}>
                <Link
                  href={getStudentClassHref(classRow.id)}
                  className={cn(
                    "flex h-full flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-5 transition-colors hover:border-border-strong hover:bg-bg-subtle/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <h2 className="truncate text-lg font-semibold text-text-primary">
                        {classRow.name}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {classRow.owner.name}
                      </p>
                    </div>
                    <Badge tone={isArchived ? "neutral" : "success"}>
                      {isArchived ? "Đã lưu trữ" : "Đang học"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                    <span className="rounded-full bg-bg-subtle px-2.5 py-1 font-mono">
                      {classRow.code}
                    </span>
                    <span className="rounded-full bg-bg-subtle px-2.5 py-1">
                      {classRow.exams.length} bài kiểm tra
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 text-xs text-text-muted">
                    <span>Tham gia {formatDate(membership.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 text-accent-text">
                      Mở lớp
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function StudentClassesViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-8">
      <div className="h-10 w-64 rounded-lg bg-bg-subtle" />
      <div className="h-40 rounded-2xl bg-bg-subtle" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-44 rounded-xl bg-bg-subtle" />
        <div className="h-44 rounded-xl bg-bg-subtle" />
      </div>
    </div>
  );
}
