"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { cn } from "@/lib/cn";
import { ComingSoonBadge } from "./coming-soon-badge";
import { LoginLink } from "./login-link";
import {
  FOCUS_RING_CLASS_NAME,
  type IHeaderCategory,
  isCurrentPage,
  NAV_ITEMS,
} from "./nav-items";

const DESKTOP_QUERY = "(min-width: 48rem)";

const ICON_BUTTON_CLASS_NAME = cn(
  "flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary",
  FOCUS_RING_CLASS_NAME,
);

type MobileMenuProps = {
  categories: readonly IHeaderCategory[];
  pathname: string | null;
};

export function MobileMenu({ categories, pathname }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeOnDesktop = () => {
      if (desktop.matches) {
        dialogRef.current?.close();
      }
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Mở menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          dialogRef.current?.showModal();
          setIsOpen(true);
        }}
        className={ICON_BUTTON_CLASS_NAME}
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: bấm ra nền là cách đóng thêm cho chuột, bàn phím đã có Esc của dialog. */}
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-80 max-w-[calc(100%-3rem)] translate-x-full border-l border-border-default bg-bg-surface p-0 text-text-primary transition-[translate,display,overlay] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] transition-discrete backdrop:bg-bg-page/60 backdrop:opacity-0 backdrop:backdrop-blur-sm backdrop:transition-[opacity,display,overlay] backdrop:duration-300 backdrop:transition-discrete open:translate-x-0 open:backdrop:opacity-100 motion-reduce:transition-none starting:open:translate-x-full starting:open:backdrop:opacity-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-default px-4">
            <span className="text-sm font-semibold">Menu</span>
            <button
              type="button"
              aria-label="Đóng menu"
              onClick={close}
              className={ICON_BUTTON_CLASS_NAME}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 py-4">
            <nav aria-label="Điều hướng chính">
              <ul className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => {
                  const isCurrent = isCurrentPage(item, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent ? "page" : undefined}
                        onClick={close}
                        className={cn(
                          "flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                          FOCUS_RING_CLASS_NAME,
                          isCurrent
                            ? "bg-accent-subtle text-accent-text"
                            : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <nav aria-labelledby="mobile-menu-categories">
              <h2
                id="mobile-menu-categories"
                className="px-3 pb-2 text-xs font-medium text-text-secondary"
              >
                Danh mục mô phỏng
              </h2>
              <ul className="flex flex-col gap-0.5">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={category.href}
                      aria-current={
                        pathname?.startsWith(category.href) ? "page" : undefined
                      }
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-bg-subtle aria-[current=page]:bg-bg-subtle",
                        FOCUS_RING_CLASS_NAME,
                      )}
                    >
                      <CategoryIcon slug={category.slug} />
                      <span className="truncate">{category.name}</span>
                      {category.isComingSoon && <ComingSoonBadge />}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="shrink-0 border-t border-border-default p-4">
            <LoginLink className="flex h-11 w-full" onNavigate={close} />
          </div>
        </div>
      </dialog>
    </div>
  );
}

type CurrentMobileMenuProps = {
  categories: readonly IHeaderCategory[];
};

export function CurrentMobileMenu({ categories }: CurrentMobileMenuProps) {
  return <MobileMenu categories={categories} pathname={usePathname()} />;
}
