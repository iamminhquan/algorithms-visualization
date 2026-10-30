import { useId } from "react";
import type { IVariable } from "@/engine/visualization";
import { cn } from "@/lib/cn";

const EMPTY_VALUE = "—";

type VariablesPanelProps = {
  variables: readonly IVariable[];
  className?: string;
};

export function VariablesPanel({ variables, className }: VariablesPanelProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4",
        className,
      )}
    >
      <h2
        id={headingId}
        className="flex h-9 items-center text-sm font-medium text-text-primary"
      >
        Biến
      </h2>
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
    </section>
  );
}
