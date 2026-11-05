"use client";

import {
  Code2,
  Info,
  Maximize,
  Minimize,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { AiChatPanel, type IAiChatOptions } from "./ai-chat-panel";
import { CodePanel, type CodeView, type ICodePanelContent } from "./code-panel";
import { type ILegendItem, LegendList } from "./legend-list";
import { useFullscreen } from "./use-fullscreen";

export type { ILegendItem } from "./legend-list";

export interface IMetricItem {
  readonly label: string;
  readonly value: number | string;
}

const PANEL_STORAGE_KEY = "algorithm-visualizer:panel-preference";

const PANEL_WIDTH_STORAGE_KEY = "algorithm-visualizer:panel-width";

const DESKTOP_QUERY = "(min-width: 64rem)";

const DEFAULT_PANEL_WIDTH = 420;

const MIN_PANEL_WIDTH = 320;

const MAX_PANEL_WIDTH = 640;

const MAX_EXPANDED_PANEL_WIDTH = 960;

const PANEL_EXPANDED_RATIO = 0.44;

const MIN_VISUALIZATION_WIDTH = 420;

const PANEL_GAP_WIDTH = 16;

const PANEL_RESIZE_STEP = 16;

type PanelPreference = "auto" | "open" | "closed";

type PanelTab = "tracking" | "assistant";

const PANEL_VISIBILITY_CLASS_NAMES: Record<PanelPreference, string> = {
  auto: "hidden opacity-100 lg:flex lg:h-auto lg:max-h-none lg:w-[var(--panel-width)]",
  open: "flex h-[65dvh] max-h-120 opacity-100 lg:h-auto lg:max-h-none lg:w-[var(--panel-width)]",
  closed:
    "pointer-events-none flex h-0 max-h-0 opacity-0 lg:h-auto lg:max-h-none lg:w-0",
};

function getMaxPanelWidth(containerWidth: number, maxWidth: number): number {
  if (containerWidth <= 0) {
    return maxWidth;
  }
  return Math.max(
    MIN_PANEL_WIDTH,
    Math.min(
      maxWidth,
      containerWidth - MIN_VISUALIZATION_WIDTH - PANEL_GAP_WIDTH,
    ),
  );
}

function clampPanelWidth(
  width: number,
  containerWidth: number,
  maxWidth: number,
): number {
  return Math.min(
    Math.max(width, MIN_PANEL_WIDTH),
    getMaxPanelWidth(containerWidth, maxWidth),
  );
}

function getExpandedPanelWidth(containerWidth: number): number {
  if (containerWidth <= 0) {
    return DEFAULT_PANEL_WIDTH;
  }
  return clampPanelWidth(
    Math.round(containerWidth * PANEL_EXPANDED_RATIO),
    containerWidth,
    MAX_EXPANDED_PANEL_WIDTH,
  );
}

const PANEL_TABS: readonly { readonly id: PanelTab; readonly label: string }[] =
  [
    { id: "tracking", label: "Mã giả" },
    { id: "assistant", label: "Trợ lý AI" },
  ];

const ICON_BUTTON_CLASS =
  "flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default";

type VisualizerFrameProps = {
  children: ReactNode;
  description: string;
  controls: ReactNode;
  toolbar?: ReactNode;
  code?: ICodePanelContent;
  variables?: ReactNode;
  legend?: readonly ILegendItem[];
  metrics?: readonly IMetricItem[];
  assistant?: IAiChatOptions;
  className?: string;
};

export function VisualizerFrame({
  children,
  description,
  controls,
  toolbar,
  code,
  variables,
  legend = [],
  metrics = [],
  assistant,
  className,
}: VisualizerFrameProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelWidthRef = useRef(DEFAULT_PANEL_WIDTH);
  const normalPanelWidthRef = useRef(DEFAULT_PANEL_WIDTH);
  const isDockWidthCustomizedRef = useRef(false);
  const dragOriginRef = useRef<{
    readonly x: number;
    readonly width: number;
  } | null>(null);
  const revealPanelRef = useRef(false);
  const { isFullscreen, toggle } = useFullscreen(sectionRef);
  const panelId = useId();
  const [panelPreference, setPanelPreference] =
    useState<PanelPreference>("auto");
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPanelAnimationReady, setIsPanelAnimationReady] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("tracking");
  const [codeView, setCodeView] = useState<CodeView>("pseudocode");
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsPanelAnimationReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PANEL_STORAGE_KEY);
      if (stored === "open" || stored === "closed") {
        setPanelPreference(stored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const stored = Number(
        window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY),
      );
      if (!Number.isFinite(stored) || stored <= 0) {
        return;
      }
      const next = window.matchMedia(DESKTOP_QUERY).matches
        ? clampPanelWidth(
            stored,
            gridRef.current?.getBoundingClientRect().width ?? 0,
            MAX_PANEL_WIDTH,
          )
        : Math.min(Math.max(stored, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH);
      panelWidthRef.current = next;
      normalPanelWidthRef.current = next;
      setPanelWidth(next);
    } catch {}
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (grid === null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (!window.matchMedia(DESKTOP_QUERY).matches) {
        return;
      }
      const containerWidth = grid.getBoundingClientRect().width;
      const next =
        isCodeExpanded && !isDockWidthCustomizedRef.current
          ? getExpandedPanelWidth(containerWidth)
          : clampPanelWidth(
              panelWidthRef.current,
              containerWidth,
              isCodeExpanded ? MAX_EXPANDED_PANEL_WIDTH : MAX_PANEL_WIDTH,
            );
      if (next === panelWidthRef.current) {
        return;
      }
      panelWidthRef.current = next;
      setPanelWidth(next);
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [isCodeExpanded]);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isDesktop || !isCodeExpanded) {
      return;
    }
    setIsCodeExpanded(false);
    panelWidthRef.current = normalPanelWidthRef.current;
    setPanelWidth(normalPanelWidthRef.current);
  }, [isDesktop, isCodeExpanded]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }
    const { style } = document.body;
    const previousCursor = style.cursor;
    const previousUserSelect = style.userSelect;
    style.cursor = "col-resize";
    style.userSelect = "none";
    return () => {
      style.cursor = previousCursor;
      style.userSelect = previousUserSelect;
    };
  }, [isResizing]);

  const isPanelOpen =
    panelPreference === "open" || (panelPreference === "auto" && isDesktop);

  const applyPanelPreference = (next: PanelPreference) => {
    setPanelPreference(next);
    try {
      window.localStorage.setItem(PANEL_STORAGE_KEY, next);
    } catch {}
  };

  const togglePanel = () => {
    const currentlyOpen =
      panelPreference === "open" || (panelPreference === "auto" && isDesktop);
    revealPanelRef.current = !currentlyOpen;
    applyPanelPreference(currentlyOpen ? "closed" : "open");
  };

  const persistPanelWidth = (width: number) => {
    try {
      window.localStorage.setItem(
        PANEL_WIDTH_STORAGE_KEY,
        String(Math.round(width)),
      );
    } catch {}
  };

  const applyPanelWidth = (width: number, expanded = isCodeExpanded) => {
    const next = clampPanelWidth(
      width,
      gridRef.current?.getBoundingClientRect().width ?? 0,
      expanded ? MAX_EXPANDED_PANEL_WIDTH : MAX_PANEL_WIDTH,
    );
    panelWidthRef.current = next;
    setPanelWidth(next);
    return next;
  };

  const commitPanelWidth = (width: number, expanded = isCodeExpanded) => {
    const next = applyPanelWidth(width, expanded);
    if (!expanded) {
      persistPanelWidth(next);
    }
    return next;
  };

  const toggleCodeExpanded = () => {
    if (isCodeExpanded) {
      isDockWidthCustomizedRef.current = false;
      applyPanelWidth(normalPanelWidthRef.current, false);
      setIsCodeExpanded(false);
      return;
    }
    normalPanelWidthRef.current = panelWidthRef.current;
    isDockWidthCustomizedRef.current = false;
    setIsCodeExpanded(true);
    const expandedWidth = Math.max(
      panelWidthRef.current,
      getExpandedPanelWidth(
        gridRef.current?.getBoundingClientRect().width ?? 0,
      ),
    );
    applyPanelWidth(expandedWidth, true);
  };

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOriginRef.current = {
      x: event.clientX,
      width: panelWidthRef.current,
    };
    setIsResizing(true);
  };

  const handleResizeMove = (event: PointerEvent<HTMLDivElement>) => {
    const origin = dragOriginRef.current;
    if (origin === null) {
      return;
    }
    if (isCodeExpanded) {
      isDockWidthCustomizedRef.current = true;
    }
    applyPanelWidth(origin.width - (event.clientX - origin.x));
  };

  const handleResizeEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragOriginRef.current === null) {
      return;
    }
    dragOriginRef.current = null;
    setIsResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!isCodeExpanded) {
      persistPanelWidth(panelWidthRef.current);
    }
  };

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    if (
      isCodeExpanded &&
      (key === "Home" ||
        key === "End" ||
        key === "ArrowLeft" ||
        key === "ArrowRight")
    ) {
      isDockWidthCustomizedRef.current = true;
    }
    if (key === "Home") {
      event.preventDefault();
      commitPanelWidth(MIN_PANEL_WIDTH);
      return;
    }
    if (key === "End") {
      event.preventDefault();
      commitPanelWidth(Number.POSITIVE_INFINITY);
      return;
    }
    if (key !== "ArrowLeft" && key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const delta = key === "ArrowLeft" ? PANEL_RESIZE_STEP : -PANEL_RESIZE_STEP;
    commitPanelWidth(panelWidthRef.current + delta);
  };

  useEffect(() => {
    if (!isPanelOpen || !revealPanelRef.current) {
      return;
    }
    revealPanelRef.current = false;
    if (isDesktop) {
      return;
    }
    const panel = panelRef.current;
    if (panel === null) {
      return;
    }
    if (panel.getBoundingClientRect().top <= window.innerHeight * 0.6) {
      return;
    }
    panel.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [isPanelOpen, isDesktop]);

  const handleTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    if (
      key !== "ArrowLeft" &&
      key !== "ArrowRight" &&
      key !== "Home" &&
      key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const currentIndex = PANEL_TABS.findIndex((tab) => tab.id === activeTab);
    const nextIndex =
      key === "Home"
        ? 0
        : key === "End"
          ? PANEL_TABS.length - 1
          : (currentIndex +
              (key === "ArrowRight" ? 1 : -1) +
              PANEL_TABS.length) %
            PANEL_TABS.length;
    const nextTab = PANEL_TABS[nextIndex];
    if (nextTab === undefined) {
      return;
    }
    setActiveTab(nextTab.id);
    event.currentTarget
      .querySelector<HTMLElement>(`[data-tab="${nextTab.id}"]`)
      ?.focus();
  };

  const panelToggleLabel = isPanelOpen
    ? "Ẩn bảng theo dõi"
    : "Hiện bảng theo dõi";
  const PanelToggleIcon = isPanelOpen ? PanelRightClose : PanelRightOpen;
  const fullscreenLabel = isFullscreen
    ? "Thoát toàn màn hình"
    : "Toàn màn hình";
  const FullscreenIcon = isFullscreen ? Minimize : Maximize;
  const resizeMaxWidth = isCodeExpanded
    ? MAX_EXPANDED_PANEL_WIDTH
    : MAX_PANEL_WIDTH;

  return (
    <section
      ref={sectionRef}
      aria-label="Mô phỏng"
      className={cn(
        "flex flex-col gap-4",
        isFullscreen &&
          "fixed inset-0 z-50 h-dvh overflow-y-auto bg-bg-page p-4 sm:p-6 lg:overflow-hidden",
        className,
      )}
    >
      {toolbar}
      <div
        ref={gridRef}
        style={{ "--panel-width": `${panelWidth}px` } as CSSProperties}
        className={cn(
          "grid gap-y-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]",
          isFullscreen &&
            "max-lg:flex-none lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)]",
        )}
      >
        <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <div
            className={cn(
              "relative flex min-h-0 flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:p-6",
              isFullscreen && "lg:flex-1",
            )}
          >
            <div className="absolute top-3 right-3 z-10 flex items-center gap-x-4 sm:top-5 sm:right-5 sm:gap-x-6">
              {metrics.length > 0 && (
                <dl className="flex gap-x-4 text-sm sm:gap-x-6">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="flex gap-1.5">
                      <dt className="text-text-secondary">{metric.label}</dt>
                      <dd className="font-mono text-text-primary tabular-nums">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              <button
                type="button"
                aria-label={panelToggleLabel}
                title={panelToggleLabel}
                aria-expanded={isPanelOpen}
                aria-controls={panelId}
                onClick={togglePanel}
                className={ICON_BUTTON_CLASS}
              >
                <PanelToggleIcon aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                aria-label={fullscreenLabel}
                title={fullscreenLabel}
                onClick={toggle}
                className={ICON_BUTTON_CLASS}
              >
                <FullscreenIcon aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div
              className={
                isFullscreen
                  ? "isolate h-[52dvh] min-h-64 lg:h-auto lg:min-h-0 lg:flex-1"
                  : "isolate h-64 sm:h-80"
              }
            >
              {children}
            </div>
            <p
              aria-live="polite"
              className="flex min-h-17 items-start gap-2.5 rounded-lg border border-border-default bg-bg-subtle px-3 py-2.5 text-sm leading-6 text-text-primary sm:min-h-11"
            >
              <Info
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-accent-text"
              />
              <span>{description}</span>
            </p>
          </div>
          {variables !== undefined && (
            <div className="shrink-0">{variables}</div>
          )}
          <div className="flex min-w-0 flex-col gap-4">{controls}</div>
          {legend.length > 0 && <LegendList items={legend} />}
        </div>
        <hr
          aria-label="Điều chỉnh độ rộng bảng mã"
          aria-orientation="vertical"
          aria-valuemin={MIN_PANEL_WIDTH}
          aria-valuemax={resizeMaxWidth}
          aria-valuenow={Math.round(panelWidth)}
          aria-hidden={isPanelOpen ? undefined : true}
          tabIndex={isPanelOpen ? 0 : -1}
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          onKeyDown={handleResizeKeyDown}
          className={cn(
            "relative m-0 hidden h-auto touch-none select-none self-stretch overflow-hidden border-0 bg-transparent before:absolute before:top-1/2 before:left-1/2 before:h-16 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default lg:col-start-2 lg:row-start-1 lg:block",
            isPanelAnimationReady &&
              "transition-[width] duration-300 ease-out motion-reduce:transition-none",
            isPanelOpen
              ? "cursor-col-resize lg:w-4"
              : "pointer-events-none lg:w-0",
            isResizing
              ? "before:bg-accent-default"
              : "before:bg-border-default hover:before:bg-border-strong focus-visible:before:bg-accent-default",
          )}
        />
        <div
          ref={panelRef}
          id={panelId}
          inert={!isPanelOpen}
          className={cn(
            "min-w-0 scroll-mt-20 flex-col overflow-hidden lg:col-start-3 lg:row-start-1",
            isPanelAnimationReady &&
              "transition-[width,margin,opacity,height,max-height] duration-300 ease-out motion-reduce:transition-none",
            "lg:min-h-0 lg:self-stretch lg:[contain:size]",
            PANEL_VISIBILITY_CLASS_NAMES[panelPreference],
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:w-[var(--panel-width)]">
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border-default bg-bg-surface p-1">
              <div
                role="tablist"
                aria-label="Bảng phụ"
                onKeyDown={handleTabListKeyDown}
                className="flex min-w-0 flex-1 gap-1"
              >
                {PANEL_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`${panelId}-${tab.id}-tab`}
                      data-tab={tab.id}
                      aria-selected={isActive}
                      aria-controls={`${panelId}-${tab.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
                        isActive
                          ? "bg-bg-subtle text-text-primary"
                          : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                      )}
                    >
                      {tab.id === "tracking" ? (
                        <Code2 aria-hidden="true" className="size-4" />
                      ) : (
                        <Sparkles aria-hidden="true" className="size-4" />
                      )}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div
              id={`${panelId}-tracking`}
              role="tabpanel"
              aria-labelledby={`${panelId}-tracking-tab`}
              className={cn(
                "flex min-h-0 flex-1 flex-col",
                activeTab !== "tracking" && "hidden",
              )}
            >
              {code !== undefined && (
                <CodePanel
                  className="min-h-0 flex-1"
                  pseudocode={code.pseudocode}
                  sourceCode={code.sourceCode}
                  activeLine={code.activeLine}
                  view={codeView}
                  onViewChange={setCodeView}
                  isExpanded={isCodeExpanded}
                  onToggleExpand={toggleCodeExpanded}
                  canDock={isDesktop}
                />
              )}
            </div>
            <div
              id={`${panelId}-assistant`}
              role="tabpanel"
              aria-labelledby={`${panelId}-assistant-tab`}
              className={cn(
                "min-h-0 flex-1",
                activeTab !== "assistant" && "hidden",
              )}
            >
              <AiChatPanel {...assistant} className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VisualizerSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <div className="h-51 rounded-xl bg-bg-subtle sm:h-31" />
      <div className="grid gap-y-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <div className="h-93 rounded-xl bg-bg-subtle sm:h-107" />
          <div className="h-20 rounded-xl bg-bg-subtle" />
          <div className="h-16 rounded-xl bg-bg-subtle" />
        </div>
        <div className="hidden w-96 rounded-xl bg-bg-subtle lg:col-start-3 lg:row-start-1 lg:block lg:self-stretch" />
      </div>
    </div>
  );
}
