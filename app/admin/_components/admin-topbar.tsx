import { Bell, Search } from "lucide-react";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "../../_components/header/theme-toggle";
import { AdminMobileNav, CurrentAdminMobileNav } from "./admin-mobile-nav";
import { UserAvatar } from "./user-avatar";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border-default bg-bg-surface/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <Suspense fallback={<AdminMobileNav pathname={null} />}>
        <CurrentAdminMobileNav />
      </Suspense>
      <div className="relative hidden w-full max-w-sm sm:block">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          aria-label="Tìm kiếm trong trang quản trị"
          placeholder="Tìm thuật toán, bài học, người dùng…"
          className="h-9 w-full rounded-lg border border-border-default bg-bg-page pr-3 pl-9 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
        />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <button
          type="button"
          aria-label="Thông báo"
          className={getButtonClassName(
            "ghost",
            "icon",
            "relative size-9 rounded-full",
          )}
        >
          <Bell aria-hidden="true" className="size-4.5" />
          <span
            aria-hidden="true"
            className="absolute top-2 right-2 size-2 rounded-full bg-danger-default ring-2 ring-bg-surface"
          />
        </button>
        <Suspense fallback={<CurrentAdminSkeleton />}>
          <CurrentAdminSummary />
        </Suspense>
      </div>
    </header>
  );
}

async function CurrentAdminSummary() {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUser = session?.user;
  const name = currentUser?.name ?? "Chưa đăng nhập";
  const email = currentUser?.email ?? "Đăng nhập để xem thông tin";

  return (
    <div className="ml-2 flex items-center gap-3 border-l border-border-default pl-3">
      <UserAvatar name={name} />
      <div className="hidden flex-col sm:flex">
        <span className="text-sm font-medium text-text-primary">{name}</span>
        <span className="text-xs text-text-muted">{email}</span>
      </div>
    </div>
  );
}

function CurrentAdminSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="ml-2 flex animate-pulse items-center gap-3 border-l border-border-default pl-3"
    >
      <span className="size-8 rounded-full bg-bg-subtle" />
      <div className="hidden flex-col gap-1 sm:flex">
        <span className="h-4 w-24 rounded bg-bg-subtle" />
        <span className="h-3 w-32 rounded bg-bg-subtle" />
      </div>
    </div>
  );
}
