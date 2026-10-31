import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Panel({
  title,
  description,
  actions,
  className,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-border-default bg-bg-surface",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-default px-5 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}
