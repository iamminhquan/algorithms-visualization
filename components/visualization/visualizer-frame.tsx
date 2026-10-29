import { Info, Maximize } from "lucide-react";
import type { ReactNode } from "react";
import type { VisualTone } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import { AiChatPanel, type IAiChatOptions } from "./ai-chat-panel";
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
  code?: ReactNode;
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
  legend = [],
  metrics = [],
  assistant,
  className,
}: VisualizerFrameProps) {
  return (
    <section
      aria-label="Mô phỏng"
      className={cn("flex flex-col gap-4", className)}
    >
      {toolbar}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:p-6">
          <div className="absolute top-3 right-3 flex items-center gap-x-4 sm:top-5 sm:right-5 sm:gap-x-6">
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
              aria-label="Toàn màn hình"
              title="Toàn màn hình"
              className="flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
            >
              <Maximize aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="h-64 sm:h-80">{children}</div>
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
        <div className="relative order-last h-112 lg:order-none lg:h-auto">
          <AiChatPanel
            {...assistant}
            className="h-full lg:absolute lg:inset-0"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          {controls}
          {legend.length > 0 && (
            <ul
              aria-label="Chú giải màu"
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary"
            >
              {legend.map((item) => (
                <li key={item.tone} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-3 rounded-sm",
                      TONE_BACKGROUND[item.tone],
                    )}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
          {code}
        </div>
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
