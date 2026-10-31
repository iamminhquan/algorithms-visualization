import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Khung chung của trang đăng nhập và đăng ký: tiêu đề, form ở giữa, dòng chuyển trang ở cuối.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="flex flex-1 items-start justify-center px-4 pt-10 pb-24 sm:px-8 sm:pt-16">
      <div className="flex w-full max-w-105 flex-col gap-6 rounded-2xl border border-border-default bg-bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          <p className="text-sm leading-5.5 text-text-secondary">
            {description}
          </p>
        </div>
        {children}
        <p className="text-center text-sm text-text-secondary">{footer}</p>
      </div>
    </main>
  );
}
