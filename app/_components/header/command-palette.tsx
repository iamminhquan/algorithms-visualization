"use client";

import { CornerDownLeft, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CategorySlug } from "@/features/catalog/categories";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { cn } from "@/lib/cn";
import { ComingSoonBadge } from "./coming-soon-badge";
import { FOCUS_RING_CLASS_NAME, type IHeaderCategory } from "./nav-items";

interface ISearchResult {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly slug: CategorySlug;
  readonly isComingSoon: boolean;
}

interface ISearchGroup {
  readonly heading: string;
  readonly results: readonly ISearchResult[];
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

function matches(query: string, haystack: string) {
  const normalizedHaystack = normalize(haystack);
  return normalize(query)
    .split(/\s+/)
    .every((word) => normalizedHaystack.includes(word));
}

function searchCatalog(
  categories: readonly IHeaderCategory[],
  query: string,
): ISearchGroup[] {
  const categoryGroup: ISearchGroup = {
    heading: "Danh mục",
    results: categories
      .filter((category) => matches(query, category.name))
      .map((category) => ({
        id: category.href,
        label: category.name,
        href: category.href,
        slug: category.slug,
        isComingSoon: category.isComingSoon,
      })),
  };
  const algorithmGroups = categories.map((category) => ({
    heading: category.name,
    results: category.algorithms
      .filter((algorithm) =>
        matches(query, `${algorithm.name} ${category.name}`),
      )
      .map((algorithm) => ({
        id: algorithm.href,
        label: algorithm.name,
        href: algorithm.href,
        slug: category.slug,
        isComingSoon: false,
      })),
  }));
  return [categoryGroup, ...algorithmGroups].filter(
    (group) => group.results.length > 0,
  );
}

const subscribeToNothing = () => () => {};

function useIsApplePlatform() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );
}

type CommandPaletteProps = {
  categories: readonly IHeaderCategory[];
};

export function CommandPalette({ categories }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const isApplePlatform = useIsApplePlatform();
  const listboxId = useId();
  const groups = searchCatalog(categories, query);
  const results = groups.flatMap((group) => group.results);
  const activeResult = results.at(Math.min(activeIndex, results.length - 1));
  const getOptionId = (result: ISearchResult) => `${listboxId}-${result.id}`;

  const open = () => {
    setQuery("");
    setActiveIndex(0);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const toggleOnShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) {
          dialogRef.current.close();
        } else {
          setQuery("");
          setActiveIndex(0);
          dialogRef.current?.showModal();
        }
      }
    };
    document.addEventListener("keydown", toggleOnShortcut);
    return () => document.removeEventListener("keydown", toggleOnShortcut);
  }, []);

  const moveActive = (nextIndex: number) => {
    if (results.length === 0) {
      return;
    }
    const index = (nextIndex + results.length) % results.length;
    setActiveIndex(index);
    document
      .getElementById(getOptionId(results[index]))
      ?.scrollIntoView({ block: "nearest" });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const currentIndex = Math.min(activeIndex, results.length - 1);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(currentIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(currentIndex - 1);
    } else if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      router.push(activeResult.href);
      close();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Tìm thuật toán"
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={open}
        className={cn(
          "flex size-9 items-center justify-center gap-2 rounded-full text-sm text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary lg:w-60 lg:justify-start lg:rounded-xl lg:border lg:border-border-default lg:bg-bg-surface lg:pr-1.5 lg:pl-3 lg:hover:border-border-strong lg:hover:bg-bg-surface",
          FOCUS_RING_CLASS_NAME,
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden lg:inline">Tìm thuật toán...</span>
        <kbd className="ml-auto hidden h-6 items-center rounded-md border border-border-default bg-bg-page px-1.5 font-sans text-xs text-text-secondary lg:inline-flex">
          {isApplePlatform ? "⌘" : "Ctrl"} K
        </kbd>
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: bấm ra nền là cách đóng thêm cho chuột, bàn phím đã có Esc của dialog. */}
      <dialog
        ref={dialogRef}
        aria-label="Tìm thuật toán"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
        className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl scale-[0.98] overflow-hidden rounded-2xl border border-border-default bg-bg-surface p-0 text-text-primary opacity-0 shadow-2xl shadow-text-primary/10 transition-[opacity,scale,display,overlay] duration-150 ease-out transition-discrete backdrop:bg-bg-page/60 backdrop:opacity-0 backdrop:backdrop-blur-sm backdrop:transition-[opacity,display,overlay] backdrop:duration-150 backdrop:transition-discrete open:scale-100 open:opacity-100 open:backdrop:opacity-100 motion-reduce:transition-none starting:open:scale-[0.98] starting:open:opacity-0 starting:open:backdrop:opacity-0"
      >
        <div className="flex items-center gap-3 border-b border-border-default px-4">
          <Search
            aria-hidden="true"
            className="size-4.5 shrink-0 text-text-secondary"
          />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeResult ? getOptionId(activeResult) : undefined
            }
            aria-label="Tìm thuật toán hoặc danh mục"
            placeholder="Tìm thuật toán hoặc danh mục..."
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-text-primary outline-none placeholder:text-text-secondary"
          />
          <kbd className="hidden h-6 items-center rounded-md border border-border-default bg-bg-page px-1.5 font-sans text-xs text-text-secondary sm:inline-flex">
            Esc
          </kbd>
        </div>
        <div
          id={listboxId}
          role="listbox"
          aria-label="Kết quả tìm kiếm"
          className="max-h-[min(24rem,55vh)] overflow-y-auto overscroll-contain p-2"
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-text-secondary">
              <SearchX aria-hidden="true" className="size-5" />
              <p>Không tìm thấy kết quả nào cho “{query.trim()}”.</p>
            </div>
          ) : (
            groups.map((group) => (
              // biome-ignore lint/a11y/useSemanticElements: nhóm option trong listbox theo mẫu ARIA, không phải nhóm ô nhập của form.
              <div
                key={group.heading}
                role="group"
                aria-label={group.heading}
                className="not-first:mt-2"
              >
                <div
                  aria-hidden="true"
                  className="px-2.5 pt-2 pb-1.5 text-xs font-medium text-text-secondary"
                >
                  {group.heading}
                </div>
                {group.results.map((result) => {
                  const isActive = result === activeResult;
                  return (
                    <Link
                      key={result.id}
                      id={getOptionId(result)}
                      href={result.href}
                      role="option"
                      aria-selected={isActive}
                      tabIndex={-1}
                      onClick={close}
                      onPointerMove={() =>
                        setActiveIndex(results.indexOf(result))
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-text-primary",
                        isActive && "bg-bg-subtle",
                      )}
                    >
                      <CategoryIcon slug={result.slug} size="sm" />
                      <span className="truncate">{result.label}</span>
                      {result.isComingSoon && <ComingSoonBadge />}
                      {isActive && (
                        <CornerDownLeft
                          aria-hidden="true"
                          className="ml-auto size-4 shrink-0 text-text-secondary"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-border-default bg-bg-page px-4 py-2.5 text-xs text-text-secondary sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-bg-surface px-1 font-sans">
              ↑
            </kbd>
            <kbd className="rounded border border-border-default bg-bg-surface px-1 font-sans">
              ↓
            </kbd>
            di chuyển
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-bg-surface px-1 font-sans">
              Enter
            </kbd>
            mở
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-bg-surface px-1 font-sans">
              Esc
            </kbd>
            đóng
          </span>
        </div>
      </dialog>
    </>
  );
}
