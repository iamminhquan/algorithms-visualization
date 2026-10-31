import type { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { SampleDataBadge } from "./sample-data-badge";

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  isSampleData?: boolean;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  isSampleData = false,
}: StatCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-text-secondary">{label}</h2>
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-lg bg-bg-subtle text-text-secondary"
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-text-primary">
        {formatNumber(value)}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>{hint}</span>
        {isSampleData && <SampleDataBadge />}
      </div>
    </article>
  );
}
