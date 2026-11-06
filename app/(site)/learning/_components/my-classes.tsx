import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { getLearningUser } from "@/features/learning/auth";
import { getStudentClasses } from "@/features/learning/queries";
import {
  getStudentClassHref,
  STUDENT_CLASSES_PATH,
} from "@/features/learning/routes";

const MAX_VISIBLE_CLASSES = 3;

export async function MyClassesSection() {
  const user = await getLearningUser();

  if (!user) {
    return (
      <ClassesSection>
        <EmptyClasses />
      </ClassesSection>
    );
  }

  if (user.role !== "student") {
    return (
      <ClassesSection>
        <div className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Tài khoản giảng viên quản lý lớp học tại trang quản trị.
          </p>
          <Link
            href="/admin/classes"
            className={getButtonClassName("secondary", "sm", "self-start")}
          >
            Đến trang quản trị
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </ClassesSection>
    );
  }

  const memberships = await getStudentClasses(user);

  if (memberships.length === 0) {
    return (
      <ClassesSection>
        <EmptyClasses />
      </ClassesSection>
    );
  }

  return (
    <ClassesSection>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {memberships.slice(0, MAX_VISIBLE_CLASSES).map((membership) => {
          const classRow = membership.class;
          const isArchived = classRow.status === "archived";
          return (
            <li key={membership.id}>
              <Link
                href={getStudentClassHref(classRow.id)}
                className="flex h-full flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4 transition-colors hover:border-border-strong hover:bg-bg-subtle/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 truncate text-sm font-semibold text-text-primary">
                    {classRow.name}
                  </h3>
                  <Badge tone={isArchived ? "neutral" : "success"}>
                    {isArchived ? "Đã lưu trữ" : "Đang học"}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Giảng viên {classRow.owner.name}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-text-muted">
                    {classRow.code}
                  </span>
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
    </ClassesSection>
  );
}

function ClassesSection({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="my-classes" className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-4">
        <h2
          id="my-classes"
          className="text-xl font-semibold tracking-tight text-text-primary"
        >
          Lớp học của tôi
        </h2>
        <Link
          href={STUDENT_CLASSES_PATH}
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Xem tất cả
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </header>
      {children}
    </section>
  );
}

function EmptyClasses() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border-strong bg-bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-secondary">Chưa tham gia lớp học nào</p>
      <Link
        href={STUDENT_CLASSES_PATH}
        className={getButtonClassName("primary", "sm", "self-start")}
      >
        <Plus aria-hidden="true" />
        Tham gia lớp học
      </Link>
    </div>
  );
}

export function MyClassesSectionSkeleton() {
  return (
    <section aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="h-6 w-36 rounded bg-bg-subtle" />
        <div className="h-4 w-16 rounded bg-bg-subtle" />
      </div>
      <div className="h-16 rounded-xl bg-bg-subtle" />
    </section>
  );
}
