"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { FOCUS_RING_CLASS_NAME } from "./nav-items";

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme: Theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {}
  };

  return (
    <button
      type="button"
      aria-label="Đổi giao diện sáng/tối"
      onClick={toggleTheme}
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary",
        FOCUS_RING_CLASS_NAME,
      )}
    >
      <Moon aria-hidden="true" className="size-4.5 dark:hidden" />
      <Sun aria-hidden="true" className="hidden size-4.5 dark:block" />
    </button>
  );
}
