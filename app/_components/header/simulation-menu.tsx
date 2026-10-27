"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { VISUALIZATION_PATH } from "@/features/catalog/routes";
import { cn } from "@/lib/cn";
import { ComingSoonBadge } from "./coming-soon-badge";
import { FOCUS_RING_CLASS_NAME, type IHeaderCategory } from "./nav-items";

const CLOSE_DELAY_MS = 150;

type SimulationMenuProps = {
  categories: readonly IHeaderCategory[];
  label: string;
  isCurrent: boolean;
  pill: ReactNode;
  triggerClassName: string;
};

export function SimulationMenu({
  categories,
  label,
  isCurrent,
  pill,
  triggerClassName,
}: SimulationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const panelId = useId();
  const simulationCount = categories.reduce(
    (total, category) => total + category.algorithms.length,
    0,
  );

  const cancelClose = () => window.clearTimeout(closeTimerRef.current);
  const close = () => {
    cancelClose();
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  /*
   * `flushSync` để bảng đã có trong DOM ngay sau `setIsOpen`, nhờ vậy focus được link luôn.
   */
  const openWithFocus = (target: "first" | "last") => {
    cancelClose();
    flushSync(() => setIsOpen(true));
    const links = panelRef.current?.querySelectorAll("a") ?? [];
    links[target === "first" ? 0 : links.length - 1]?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openWithFocus("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openWithFocus("last");
    }
  };

  const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) {
      return;
    }
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
      return;
    }
    const links = Array.from(panelRef.current?.querySelectorAll("a") ?? []);
    const active = document.activeElement;
    const index =
      active instanceof HTMLAnchorElement ? links.indexOf(active) : -1;
    if (index === -1) {
      return;
    }
    const nextIndex = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: links.length - 1,
    }[event.key];
    if (nextIndex !== undefined) {
      event.preventDefault();
      links[(nextIndex + links.length) % links.length].focus();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: chỉ gom sự kiện của nút và các link bên trong, bản thân thẻ div không tương tác.
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          cancelClose();
          setIsOpen(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          closeTimerRef.current = window.setTimeout(
            () => setIsOpen(false),
            CLOSE_DELAY_MS,
          );
        }
      }}
      onKeyDown={handleContainerKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-current={isCurrent ? "page" : undefined}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        onKeyDown={handleTriggerKeyDown}
        className={cn(triggerClassName, "gap-1")}
      >
        {pill}
        <span className="relative">{label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "relative size-3.5 transition-transform duration-200 motion-reduce:transition-none",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={panelRef}
            id={panelId}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-1/2 z-10 w-136 origin-top -translate-x-1/2 pt-2"
          >
            <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-lg shadow-text-primary/5">
              <ul className="grid grid-cols-2 gap-1 p-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={category.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-bg-subtle focus-visible:bg-bg-subtle",
                        FOCUS_RING_CLASS_NAME,
                      )}
                    >
                      <CategoryIcon slug={category.slug} />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                          {category.name}
                          {category.isComingSoon && <ComingSoonBadge />}
                        </span>
                        <span className="truncate text-xs text-text-secondary">
                          {category.tagline}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-4 border-t border-border-default bg-bg-page px-4 py-3">
                <p className="text-xs text-text-secondary">
                  {categories.length} danh mục · {simulationCount} mô phỏng
                </p>
                <Link
                  href={VISUALIZATION_PATH}
                  onClick={close}
                  className={cn(
                    "group/all inline-flex items-center gap-1 rounded-md text-xs font-medium text-accent-text",
                    FOCUS_RING_CLASS_NAME,
                  )}
                >
                  Xem tất cả mô phỏng
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform group-hover/all:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
