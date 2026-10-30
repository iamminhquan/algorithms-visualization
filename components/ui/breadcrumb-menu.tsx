"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/cn";

export interface IBreadcrumbOption {
  readonly label: string;
  readonly href: string;
  readonly isCurrent: boolean;
}

type BreadcrumbMenuProps = {
  label: string;
  options: readonly IBreadcrumbOption[];
};

const FOCUS_RING_CLASS_NAME =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default";

export function BreadcrumbMenu({ label, options }: BreadcrumbMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      /**
       * Lắng nghe sự kiện bấm chuột ngoài trên toàn document.
       * Nếu ngoài containerRef thì đóng menu.
       */
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

  const getLinks = () =>
    Array.from(panelRef.current?.querySelectorAll("a") ?? []);

  const openWithFocus = (target: "current" | "last") => {
    /**
     * Ép React render ngay chứ không đợi handler chạy xong mới render.
     */
    flushSync(() => setIsOpen(true));
    const links = getLinks();
    const currentLink = links.find(
      (link) => link.getAttribute("aria-current") === "page",
    );
    const focusTarget =
      target === "last" ? links.at(-1) : (currentLink ?? links.at(0));
    focusTarget?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openWithFocus("current");
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
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const links = getLinks();
    const active = document.activeElement;
    const index =
      active instanceof HTMLAnchorElement ? links.indexOf(active) : -1;
    if (index === -1) {
      return;
    }
    const nextIndex = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
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

  const handleOptionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    option: IBreadcrumbOption,
  ) => {
    if (option.isCurrent) {
      event.preventDefault();
      triggerRef.current?.focus();
    }
    setIsOpen(false);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: chỉ gom sự kiện của nút và các link bên trong, bản thân thẻ div không tương tác.
    <div
      ref={containerRef}
      className="sm:relative"
      onKeyDown={handleContainerKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-current="page"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm text-text-primary transition-colors hover:text-accent-text aria-expanded:text-accent-text",
          FOCUS_RING_CLASS_NAME,
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3.5 transition-transform duration-200 motion-reduce:transition-none",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <ul
          ref={panelRef}
          id={panelId}
          className="absolute top-full right-0 left-0 z-30 mt-2 flex flex-col gap-0.5 rounded-xl border border-border-default bg-bg-surface p-1.5 shadow-lg shadow-text-primary/5 sm:right-auto sm:w-max sm:min-w-56"
        >
          {options.map((option) => (
            <li key={option.href}>
              <Link
                href={option.href}
                aria-current={option.isCurrent ? "page" : undefined}
                onClick={(event) => handleOptionClick(event, option)}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-bg-subtle focus-visible:bg-bg-subtle aria-[current=page]:bg-accent-subtle aria-[current=page]:text-accent-text",
                  FOCUS_RING_CLASS_NAME,
                )}
              >
                {option.label}
                {option.isCurrent && (
                  <Check aria-hidden="true" className="size-4 shrink-0" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
