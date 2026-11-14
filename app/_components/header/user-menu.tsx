"use client";

import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

const MENU_ITEM_CLASS_NAME =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default";

export function UserMenu({ className, onNavigate }: UserMenuProps) {
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
  const role = (user as { role?: string }).role;
  const isStaff = role === "admin" || role === "teacher";
  const closeMenu = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={menuRef} className={cn("relative flex items-center", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Mở menu tài khoản của ${user.name}`}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 transition-colors hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
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
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-text-muted transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Tài khoản"
          className="absolute right-0 bottom-full z-50 mb-2 flex w-52 flex-col gap-0.5 rounded-xl border border-border-default bg-bg-surface p-1 shadow-lg md:top-full md:bottom-auto md:mt-2 md:mb-0"
        >
          <Link
            role="menuitem"
            href={PROFILE_PATH}
            onClick={closeMenu}
            className={MENU_ITEM_CLASS_NAME}
          >
            <User aria-hidden="true" className="size-4" />
            Hồ sơ
          </Link>
          {isStaff && (
            <Link
              role="menuitem"
              href="/admin"
              onClick={closeMenu}
              className={MENU_ITEM_CLASS_NAME}
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              Quản trị
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              closeMenu();
              await authClient.signOut();
              window.location.assign("/");
            }}
            className={cn(
              MENU_ITEM_CLASS_NAME,
              "text-danger-text hover:bg-danger-subtle hover:text-danger-text",
            )}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
