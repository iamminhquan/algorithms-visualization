"use client";

import { Info, Maximize, Minimize } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/cn";
import { AiChatPanel, type IAiChatOptions } from "./ai-chat-panel";
import { type ILegendItem, LegendList } from "./legend-list";
import { useFullscreen } from "./use-fullscreen";

export type { ILegendItem } from "./legend-list";

export interface IMetricItem {
  readonly label: string;
  readonly value: number | string;
}

type VisualizerFrameProps = {
  children: ReactNode;
  description: string;
  controls: ReactNode;
  toolbar?: ReactNode;
  code?: ReactNode;
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
  const { isFullscreen, toggle } = useFullscreen(sectionRef);
  const hasTwoColumns = !isFullscreen || code !== undefined;
  const fullscreenLabel = isFullscreen
    ? "Thoát toàn màn hình"
    : "Toàn màn hình";
  const FullscreenIcon = isFullscreen ? Minimize : Maximize;

  return (
    <section
      ref={sectionRef}
      aria-label="Mô phỏng"
      className={cn(
        "flex flex-col gap-4",
        isFullscreen &&
          "fixed inset-0 z-50 overflow-y-auto bg-bg-page p-4 sm:p-6",
        className,
      )}
    >
      {toolbar !== undefined && (
        <div className={cn(isFullscreen && "hidden")}>{toolbar}</div>
      )}
      <div
        className={cn(
          "grid gap-4",
          hasTwoColumns && "lg:grid-cols-[minmax(0,1fr)_22rem]",
          isFullscreen && "flex-1 lg:grid-rows-[1fr_auto]",
        )}
      >
        <div className="relative flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:p-6">
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
              aria-label={fullscreenLabel}
              title={fullscreenLabel}
              onClick={toggle}
              className="flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
            >
              <FullscreenIcon aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div
            className={
              isFullscreen
                ? "isolate h-[60dvh] min-h-64 lg:h-auto lg:flex-1"
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
        <div
          className={cn(
            "relative order-last h-112 lg:order-none lg:h-auto",
            isFullscreen && "hidden",
          )}
        >
          <AiChatPanel
            {...assistant}
            className="h-full lg:absolute lg:inset-0"
          />
        </div>
        <div
          className={cn(
            "flex min-w-0 flex-col gap-4",
            hasTwoColumns && "lg:col-span-2",
          )}
        >
          {controls}
          {legend.length > 0 && <LegendList items={legend} />}
        </div>
        {code !== undefined && (
          <div
            className={cn(
              "grid min-w-0 grid-cols-1 gap-4",
              isFullscreen
                ? "lg:col-start-2 lg:row-start-1 lg:grid-rows-[1fr_auto] lg:overflow-y-auto"
                : "lg:col-span-2",
              !isFullscreen &&
                variables !== undefined &&
                "lg:grid-cols-[minmax(0,1fr)_22rem]",
            )}
          >
            {code}
            {variables}
          </div>
        )}
      </div>
    </section>
  );
}

export function VisualizerSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <div className="h-51 rounded-xl bg-bg-subtle sm:h-31" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-93 rounded-xl bg-bg-subtle sm:h-107" />
        <div className="hidden rounded-xl bg-bg-subtle lg:block" />
      </div>
      <div className="h-28 rounded-xl bg-bg-subtle sm:h-16" />
    </div>
  );
}
