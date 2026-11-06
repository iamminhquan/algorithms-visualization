import { useId } from "react";
import type { IVariable } from "@/engine/visualization";
import { cn } from "@/lib/cn";

const EMPTY_VALUE = "—";

type VariablesPanelProps = {
  variables: readonly IVariable[];
  compact?: boolean;
  className?: string;
};

export function VariablesPanel({
  variables,
  compact = false,
  className,
}: VariablesPanelProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={compact ? undefined : headingId}
      aria-label={compact ? "Biến" : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      {!compact && (
        <h2
          id={headingId}
          className="flex h-9 items-center text-sm font-medium text-text-primary"
        >
          Biến
        </h2>
      )}
      {compact ? (
        <dl className="flex flex-wrap gap-1.5 font-mono text-xs">
          {variables.map((variable) => (
            <div
              key={variable.name}
              className="inline-flex items-baseline gap-1.5 rounded-md border border-border-default bg-bg-surface px-2 py-1"
            >
              <dt className="text-text-secondary">{variable.name}</dt>
              <dd
                className={cn(
                  "font-semibold tabular-nums",
                  variable.value === undefined
                    ? "text-text-muted"
                    : "text-text-primary",
                )}
              >
                {variable.value ?? EMPTY_VALUE}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-y-0.5 font-mono text-sm leading-6">
          {variables.map((variable) => (
            <div
              key={variable.name}
              className="col-span-2 grid grid-cols-subgrid gap-x-4 px-2 py-0.5"
            >
              <dt className="text-text-secondary">{variable.name}</dt>
              <dd
                className={cn(
                  "tabular-nums",
                  variable.value === undefined
                    ? "text-text-muted"
                    : "text-text-primary",
                )}
              >
                {variable.value ?? EMPTY_VALUE}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
