import { CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { type ILegendItem, LegendList } from "./legend-list";
import type { IMetricItem } from "./visualizer-frame";

type ComparisonLaneProps = {
  label: string;
  heading: ReactNode;
  metrics: readonly IMetricItem[];
  description: string;
  finishedLabel?: string;
  legend: readonly ILegendItem[];
  children: ReactNode;
  className?: string;
};

export function ComparisonLane({
  label,
  heading,
  metrics,
  description,
  finishedLabel,
  legend,
  children,
  className,
}: ComparisonLaneProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-4 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">{heading}</div>
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
      </div>
      <div className="isolate h-56 sm:h-72">{children}</div>
      <Badge
        tone="success"
        aria-hidden={finishedLabel === undefined ? true : undefined}
        className={cn("self-start", finishedLabel === undefined && "invisible")}
      >
        <CircleCheck aria-hidden="true" />
        {finishedLabel ?? "\u00a0"}
      </Badge>
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
      <LegendList items={legend} />
    </section>
  );
}
