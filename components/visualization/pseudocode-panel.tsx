import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Mỗi cấp thụt lề trong mã giả là hai dấu cách, xem `IPseudocode`.
 */
const SPACES_PER_INDENT = 2;

type PseudocodePanelProps = {
  lines: readonly string[];
  activeLine?: number;
  className?: string;
};

export function PseudocodePanel({
  lines,
  activeLine,
  className,
}: PseudocodePanelProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4",
        className,
      )}
    >
      <h2 id={headingId} className="text-sm font-medium text-text-primary">
        Mã giả
      </h2>
      <ol className="flex flex-col gap-0.5 font-mono text-sm leading-6">
        {lines.map((line, index) => {
          const indent = Math.floor(
            (line.length - line.trimStart().length) / SPACES_PER_INDENT,
          );
          const active = index === activeLine;
          return (
            <li
              key={line}
              aria-current={active ? "step" : undefined}
              className={cn(
                "rounded-r border-l-2 py-0.5 pr-2 transition-colors duration-150 motion-reduce:transition-none",
                active
                  ? "border-state-pointer bg-bg-subtle text-text-primary"
                  : "border-transparent text-text-secondary",
              )}
              style={{ paddingLeft: `${0.5 + indent * 1.25}rem` }}
            >
              {line.trimStart()}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
