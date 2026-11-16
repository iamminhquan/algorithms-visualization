"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/db/schema";
import { cn } from "@/lib/cn";
import { getVisibleAdminNavGroups, isActiveAdminItem } from "./admin-routes";

type AdminNavProps = {
  pathname: string | null;
  userRole: UserRole | null;
  onNavigate?: () => void;
};

export function AdminNav({ pathname, userRole, onNavigate }: AdminNavProps) {
  const groups = getVisibleAdminNavGroups(userRole);
  return (
    <nav aria-label="Điều hướng quản trị" className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-medium text-text-muted">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveAdminItem(item.href, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
                      isActive
                        ? "bg-accent-subtle text-accent-text"
                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4.5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function CurrentAdminNav({ userRole }: { userRole: UserRole | null }) {
  return <AdminNav pathname={usePathname()} userRole={userRole} />;
}
