"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { AdminBrand, BackToSiteLink } from "./admin-brand";
import { AdminNav } from "./admin-nav";

const DESKTOP_QUERY = "(min-width: 64rem)";

type AdminMobileNavProps = {
  pathname: string | null;
};

export function AdminMobileNav({ pathname }: AdminMobileNavProps) {
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
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Mở menu quản trị"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          dialogRef.current?.showModal();
          setIsOpen(true);
        }}
        className={getButtonClassName("ghost", "icon", "size-9 -ml-1.5")}
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: bấm ra nền là cách đóng thêm cho chuột, bàn phím đã có Esc của dialog. */}
      <dialog
        ref={dialogRef}
        aria-label="Menu quản trị"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
        className="fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-72 max-w-[calc(100%-3rem)] -translate-x-full border-r border-border-default bg-bg-surface p-0 text-text-primary transition-[translate,display,overlay] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] transition-discrete backdrop:bg-bg-page/60 backdrop:opacity-0 backdrop:backdrop-blur-sm backdrop:transition-[opacity,display,overlay] backdrop:duration-300 backdrop:transition-discrete open:translate-x-0 open:backdrop:opacity-100 motion-reduce:transition-none starting:open:-translate-x-full starting:open:backdrop:opacity-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-default px-4">
            <AdminBrand />
            <button
              type="button"
              aria-label="Đóng menu"
              onClick={close}
              className={getButtonClassName("ghost", "icon", "size-9")}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-5">
            <AdminNav pathname={pathname} onNavigate={close} />
          </div>
          <div className="shrink-0 border-t border-border-default p-3">
            <BackToSiteLink onNavigate={close} />
          </div>
        </div>
      </dialog>
    </div>
  );
}

export function CurrentAdminMobileNav() {
  return <AdminMobileNav pathname={usePathname()} />;
}
