"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getButtonClassName } from "@/components/ui/button";
import { PROFILE_PATH } from "@/features/auth/routes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { LoginLink } from "./login-link";

type UserMenuProps = {
  className: string;
  onNavigate?: () => void;
};

function getInitial(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase("vi") || "?";
}

export function UserMenu({ className, onNavigate }: UserMenuProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <span
        aria-hidden="true"
        className={cn("w-24 animate-pulse rounded-xl bg-bg-subtle", className)}
      />
    );
  }

  if (!session) {
    return <LoginLink className={className} onNavigate={onNavigate} />;
  }

  const { user } = session;

  return (
    <div className={cn("items-center gap-2", className)}>
      <Link
        href={PROFILE_PATH}
        onClick={onNavigate}
        aria-label={`Hồ sơ của ${user.name}`}
        title="Hồ sơ"
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-sm font-semibold text-accent-text"
          >
            {getInitial(user.name)}
          </span>
        )}
        <span className="min-w-0 max-w-32 flex-1 truncate text-sm font-medium text-text-primary">
          {user.name}
        </span>
      </Link>
      {(user as { role?: string }).role === "admin" ||
      (user as { role?: string }).role === "teacher" ? (
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="Trang quản trị"
          title="Quản trị"
          className={getButtonClassName("ghost", "icon")}
        >
          <LayoutDashboard />
        </Link>
      ) : null}
      <button
        type="button"
        aria-label="Đăng xuất"
        title="Đăng xuất"
        onClick={() => authClient.signOut()}
        className={getButtonClassName("ghost", "icon")}
      >
        <LogOut />
      </button>
    </div>
  );
}
