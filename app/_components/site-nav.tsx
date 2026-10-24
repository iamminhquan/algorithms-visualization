"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { VISUALIZATION_PATH } from "@/features/catalog/routes";
import { cn } from "@/lib/cn";
import { LoginLink } from "./login-link";

/**
 * Một mục trên thanh điều hướng.
 *
 * `href`: Mục chưa có trang thì trỏ tạm về `#`, như các link chưa có trang ở footer; mục này
 *   không bao giờ được đánh dấu là trang hiện tại.
 * `matchPrefix`: Coi mọi đường dẫn con (vd: `/visualization/sorting`) cũng là đang ở mục này.
 */
interface INavItem {
  readonly label: string;
  readonly href: string;
  readonly matchPrefix?: boolean;
}

const NAV_ITEMS: readonly INavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Mô phỏng", href: VISUALIZATION_PATH, matchPrefix: true },
  { label: "Học tập", href: "#" },
  { label: "Giới thiệu", href: "#" },
];

const LINK_CLASS_NAME =
  "flex items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default";

function isCurrentPage(item: INavItem, pathname: string | null): boolean {
  if (pathname === null || item.href === "#") {
    return false;
  }
  return item.matchPrefix
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : pathname === item.href;
}

type NavLinkProps = {
  item: INavItem;
  pathname: string | null;
  className?: string;
  onNavigate?: () => void;
};

function NavLink({ item, pathname, className, onNavigate }: NavLinkProps) {
  const isCurrent = isCurrentPage(item, pathname);
  return (
    <Link
      href={item.href}
      aria-current={isCurrent ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        LINK_CLASS_NAME,
        isCurrent
          ? "bg-accent-subtle text-accent-text"
          : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
        className,
      )}
    >
      {item.label}
    </Link>
  );
}

type SiteNavLinksProps = {
  pathname: string | null;
};

/**
 * Các mục điều hướng trên màn hình rộng. `pathname` là `null` khi chưa biết trang hiện tại
 * (làm fallback của Suspense), lúc đó chưa mục nào được đánh dấu.
 */
export function SiteNavLinks({ pathname }: SiteNavLinksProps) {
  return (
    <nav aria-label="Điều hướng chính" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <NavLink item={item} pathname={pathname} className="h-10" />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteNav() {
  return <SiteNavLinks pathname={usePathname()} />;
}

/**
 * Nút mở menu và bảng danh sách mục trên màn hình hẹp, bảng trượt xuống ngay dưới header
 * (header là phần tử `sticky` nên làm mốc định vị cho bảng).
 */
export function MobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  /*
   * Bảng luôn nằm trong DOM để có hiệu ứng cả lúc đóng: `grid-rows` chạy 0fr → 1fr cho chiều cao,
   * `invisible` đưa các link ra khỏi thứ tự Tab và khỏi trình đọc màn hình khi đang đóng.
   */
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Đóng menu" : "Mở menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex size-10 items-center justify-center rounded-lg border border-border-strong bg-bg-surface text-text-muted transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
      >
        <Menu
          aria-hidden="true"
          className={cn(
            "absolute size-4 transition-[opacity,rotate] duration-200 motion-reduce:transition-none",
            isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
          )}
        />
        <X
          aria-hidden="true"
          className={cn(
            "absolute size-4 transition-[opacity,rotate] duration-200 motion-reduce:transition-none",
            isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
          )}
        />
      </button>
      <nav
        id="mobile-menu"
        aria-label="Điều hướng chính"
        className={cn(
          "absolute inset-x-0 top-full grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-out motion-reduce:transition-none",
          isOpen
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden border-b border-border-default bg-bg-surface">
          <ul className="flex flex-col gap-1 px-4 py-3 sm:px-8">
            {NAV_ITEMS.map((item, index) => (
              <li
                key={item.label}
                className={cn(
                  "transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-1 opacity-0",
                )}
                style={{ transitionDelay: isOpen ? `${index * 40}ms` : "0ms" }}
              >
                <NavLink
                  item={item}
                  pathname={pathname}
                  onNavigate={close}
                  className="h-11"
                />
              </li>
            ))}
            <li
              className={cn(
                "mt-2 border-t border-border-default pt-3 transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
                isOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-1 opacity-0",
              )}
              style={{
                transitionDelay: isOpen ? `${NAV_ITEMS.length * 40}ms` : "0ms",
              }}
            >
              <LoginLink className="flex h-11 w-full" onNavigate={close} />
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
