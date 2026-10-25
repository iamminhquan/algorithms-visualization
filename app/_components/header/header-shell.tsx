"use client";

import { type ReactNode, useEffect, useState } from "react";

type HeaderShellProps = {
  children: ReactNode;
};

/**
 * Thẻ `<header>` dính trên cùng, nền trắng mờ; khi trang đã cuộn thì hiện viền dưới và bóng nhẹ.
 */
export function HeaderShell({ children }: HeaderShellProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      data-scrolled={isScrolled || undefined}
      className="sticky top-0 z-40 border-b border-transparent bg-bg-surface/80 px-4 backdrop-blur-md transition-[border-color,box-shadow] duration-200 data-scrolled:border-border-default data-scrolled:shadow-xs sm:px-8 lg:px-20"
    >
      {children}
    </header>
  );
}
