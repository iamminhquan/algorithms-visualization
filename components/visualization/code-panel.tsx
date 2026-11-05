import { Maximize2, Minimize2, WrapText } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import {
  CODE_LANGUAGE_LABELS,
  CODE_LANGUAGES,
  type SourceCode,
} from "@/engine/visualization";
import { cn } from "@/lib/cn";

const SPACES_PER_INDENT = 2;

const CODE_VIEWS = ["pseudocode", ...CODE_LANGUAGES] as const;

export type CodeView = (typeof CODE_VIEWS)[number];

const CODE_VIEW_LABELS: Record<CodeView, string> = {
  pseudocode: "Mã giả",
  ...CODE_LANGUAGE_LABELS,
};

export interface ICodePanelContent {
  readonly pseudocode: readonly string[];
  readonly sourceCode: SourceCode;
  readonly activeLine?: number;
}

type CodePanelProps = ICodePanelContent & {
  view?: CodeView;
  onViewChange?: (view: CodeView) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  canDock?: boolean;
  className?: string;
};

export function CodePanel({
  pseudocode,
  sourceCode,
  activeLine,
  view,
  onViewChange,
  isExpanded = false,
  onToggleExpand,
  canDock = false,
  className,
}: CodePanelProps) {
  const headingId = useId();
  const selectId = useId();
  const dialogSelectId = useId();
  const [internalView, setInternalView] = useState<CodeView>("pseudocode");
  const [isWrapped, setIsWrapped] = useState(false);
  const panelScrollPositions = useRef<Map<CodeView, number>>(new Map());
  const dialogScrollPositions = useRef<Map<CodeView, number>>(new Map());
  const activeView = view ?? internalView;
  const isPseudocode = activeView === "pseudocode";

  const changeView = (next: CodeView) => {
    if (view === undefined) {
      setInternalView(next);
    }
    onViewChange?.(next);
  };

  const wrapToggleLabel = isWrapped ? "Tắt xuống dòng" : "Bật xuống dòng";
  const expandLabel = isExpanded ? "Thu gọn khung mã" : "Mở rộng khung mã";
  const ExpandIcon = isExpanded ? Minimize2 : Maximize2;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <h2
          id={headingId}
          className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary"
        >
          {isPseudocode ? "Mã giả" : "Mã nguồn"}
        </h2>
        <CodeViewSelect
          id={selectId}
          value={activeView}
          onChange={changeView}
          className="w-26"
        />
        {!isPseudocode && (
          <button
            type="button"
            aria-label={wrapToggleLabel}
            aria-pressed={isWrapped}
            title={wrapToggleLabel}
            onClick={() => setIsWrapped((current) => !current)}
            className={getButtonClassName(
              isWrapped ? "primary" : "ghost",
              "icon",
            )}
          >
            <WrapText aria-hidden="true" />
          </button>
        )}
        {canDock && onToggleExpand !== undefined ? (
          <button
            type="button"
            aria-label={expandLabel}
            aria-pressed={isExpanded}
            title={expandLabel}
            onClick={onToggleExpand}
            className={getButtonClassName(
              isExpanded ? "primary" : "ghost",
              "icon",
            )}
          >
            <ExpandIcon aria-hidden="true" />
          </button>
        ) : (
          <Dialog
            title={
              isPseudocode
                ? "Mã giả"
                : `Mã nguồn ${CODE_LANGUAGE_LABELS[activeView]}`
            }
            trigger={<Maximize2 aria-hidden="true" />}
            triggerClassName={getButtonClassName("ghost", "icon")}
            triggerLabel="Mở rộng khung mã"
            size="xl"
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center justify-end gap-1">
                <CodeViewSelect
                  id={dialogSelectId}
                  value={activeView}
                  onChange={changeView}
                  className="w-40"
                />
                {!isPseudocode && (
                  <button
                    type="button"
                    aria-label={wrapToggleLabel}
                    aria-pressed={isWrapped}
                    title={wrapToggleLabel}
                    onClick={() => setIsWrapped((current) => !current)}
                    className={getButtonClassName(
                      isWrapped ? "primary" : "ghost",
                      "icon",
                    )}
                  >
                    <WrapText aria-hidden="true" />
                  </button>
                )}
              </div>
              <CodeScroller
                view={activeView}
                scrollPositions={dialogScrollPositions.current}
                className="h-[min(70dvh,40rem)] rounded-lg"
              >
                <CodeContent
                  view={activeView}
                  pseudocode={pseudocode}
                  sourceCode={sourceCode}
                  activeLine={activeLine}
                  wrap={isWrapped}
                />
              </CodeScroller>
            </div>
          </Dialog>
        )}
      </div>
      <CodeScroller
        view={activeView}
        scrollPositions={panelScrollPositions.current}
        className="flex-1"
      >
        <CodeContent
          view={activeView}
          pseudocode={pseudocode}
          sourceCode={sourceCode}
          activeLine={activeLine}
          wrap={isWrapped}
        />
      </CodeScroller>
    </section>
  );
}

type CodeViewSelectProps = {
  id: string;
  value: CodeView;
  onChange: (view: CodeView) => void;
  className?: string;
};

function CodeViewSelect({
  id,
  value,
  onChange,
  className,
}: CodeViewSelectProps) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        Ngôn ngữ hiển thị
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => {
          const next = CODE_VIEWS.find(
            (option) => option === event.currentTarget.value,
          );
          if (next !== undefined) {
            onChange(next);
          }
        }}
        className={className}
      >
        {CODE_VIEWS.map((option) => (
          <option key={option} value={option}>
            {CODE_VIEW_LABELS[option]}
          </option>
        ))}
      </Select>
    </>
  );
}

type CodeScrollerProps = {
  view: CodeView;
  scrollPositions: Map<CodeView, number>;
  className?: string;
  children: ReactNode;
};

function CodeScroller({
  view,
  scrollPositions,
  className,
  children,
}: CodeScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const previousViewRef = useRef(view);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller === null || previousViewRef.current === view) {
      return;
    }
    previousViewRef.current = view;
    scroller.scrollTop = scrollPositions.get(view) ?? 0;
  }, [scrollPositions, view]);

  return (
    <section
      ref={scrollerRef}
      aria-label={view === "pseudocode" ? "Mã giả" : "Mã nguồn"}
      onScroll={(event) => {
        scrollPositions.set(view, event.currentTarget.scrollTop);
      }}
      className={cn(
        "min-h-0 overflow-y-auto overscroll-contain [scrollbar-color:var(--color-border-strong)_transparent] [scrollbar-width:thin]",
        className,
      )}
    >
      {children}
    </section>
  );
}

type CodeContentProps = {
  view: CodeView;
  pseudocode: readonly string[];
  sourceCode: SourceCode;
  activeLine?: number;
  wrap: boolean;
};

function CodeContent({
  view,
  pseudocode,
  sourceCode,
  activeLine,
  wrap,
}: CodeContentProps) {
  if (view === "pseudocode") {
    return <PseudocodeLines lines={pseudocode} activeLine={activeLine} />;
  }
  return <SourceCodeBlock lines={sourceCode[view]} wrap={wrap} />;
}

type PseudocodeLinesProps = {
  lines: readonly string[];
  activeLine?: number;
};

function PseudocodeLines({ lines, activeLine }: PseudocodeLinesProps) {
  return (
    <ol className="flex flex-col gap-0.5 font-mono text-sm leading-6">
      {lines.map((line, index) => {
        const indent = Math.floor(
          (line.length - line.trimStart().length) / SPACES_PER_INDENT,
        );
        const active = index === activeLine;
        return (
          <li
            key={line}
            data-active-line={active ? "true" : undefined}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex gap-2 rounded-r border-l-2 py-0.5 pr-2 transition-colors duration-150 motion-reduce:transition-none",
              active
                ? "border-state-pointer bg-bg-subtle text-text-primary"
                : "border-transparent text-text-secondary",
            )}
          >
            <span
              aria-hidden="true"
              className="w-5 shrink-0 pl-2 text-right text-xs text-text-muted tabular-nums"
            >
              {index + 1}
            </span>
            <span
              className="min-w-0 flex-1 break-words"
              style={{ paddingLeft: `${indent * 1.25}rem` }}
            >
              {line.trimStart()}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type SourceCodeBlockProps = {
  lines: readonly string[];
  wrap: boolean;
};

function SourceCodeBlock({ lines, wrap }: SourceCodeBlockProps) {
  return (
    <pre
      className={cn(
        "rounded-lg bg-bg-subtle p-4 font-mono text-sm leading-6 text-text-primary",
        wrap
          ? "whitespace-pre-wrap [overflow-wrap:anywhere]"
          : "overflow-x-auto",
      )}
    >
      <code>{lines.join("\n")}</code>
    </pre>
  );
}
