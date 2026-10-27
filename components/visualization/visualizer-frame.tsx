import type { ReactNode } from "react";
import type { VisualTone } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import { TONE_BACKGROUND } from "./tones";

export interface ILegendItem {
  readonly tone: VisualTone;
  readonly label: string;
}

export interface IMetricItem {
  readonly label: string;
  readonly value: number | string;
}

type VisualizerFrameProps = {
  children: ReactNode;
  description: string;
  controls: ReactNode;
  toolbar?: ReactNode;
  aside?: ReactNode;
  legend?: readonly ILegendItem[];
  metrics?: readonly IMetricItem[];
  className?: string;
};

export function VisualizerFrame({
  children,
  description,
  controls,
  toolbar,
  aside,
  legend = [],
  metrics = [],
  className,
}: VisualizerFrameProps) {
  return (
    <section
      aria-label="Mô phỏng"
      className={cn("flex flex-col gap-4", className)}
    >
      {toolbar}
      <div
        className={cn(
          "grid gap-4",
          aside !== undefined && "lg:grid-cols-[minmax(0,1fr)_20rem]",
        )}
      >
        <div className="relative flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:p-6">
          {metrics.length > 0 && (
            <dl className="absolute top-4 right-4 flex gap-x-4 text-sm sm:top-6 sm:right-6 sm:gap-x-6">
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
          <div className="h-64 sm:h-80">{children}</div>
          <p aria-live="polite" className="sr-only">
            {description}
          </p>
        </div>
        {aside !== undefined && (
          <div className="order-last lg:order-none">{aside}</div>
        )}
        <div className={cn(aside !== undefined && "lg:col-span-2")}>
          {controls}
        </div>
      </div>
      {legend.length > 0 && (
        <ul
          aria-label="Chú giải màu"
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary"
        >
          {legend.map((item) => (
            <li key={item.tone} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn("size-3 rounded-sm", TONE_BACKGROUND[item.tone])}
              />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function VisualizerSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <div className="h-51 rounded-xl bg-bg-subtle sm:h-31" />
      <div className="h-72 rounded-xl bg-bg-subtle sm:h-92" />
      <div className="h-28 rounded-xl bg-bg-subtle sm:h-16" />
    </div>
  );
}
