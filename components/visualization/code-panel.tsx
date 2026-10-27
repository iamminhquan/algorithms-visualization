import { useId, useState } from "react";
import { Select } from "@/components/ui/select";
import { CODE_LANGUAGES, type SourceCode } from "@/engine/visualization";
import { cn } from "@/lib/cn";

const SPACES_PER_INDENT = 2;

const CODE_VIEWS = ["pseudocode", ...CODE_LANGUAGES] as const;

type CodeView = (typeof CODE_VIEWS)[number];

const CODE_VIEW_LABELS: Record<CodeView, string> = {
  pseudocode: "Mã giả",
  cpp: "C++",
};

type CodePanelProps = {
  pseudocode: readonly string[];
  sourceCode: SourceCode;
  activeLine?: number;
  className?: string;
};

export function CodePanel({
  pseudocode,
  sourceCode,
  activeLine,
  className,
}: CodePanelProps) {
  const headingId = useId();
  const selectId = useId();
  const [view, setView] = useState<CodeView>("pseudocode");

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-sm font-medium text-text-primary">
          {view === "pseudocode" ? "Mã giả" : "Mã nguồn"}
        </h2>
        <label htmlFor={selectId} className="sr-only">
          Ngôn ngữ hiển thị
        </label>
        <Select
          id={selectId}
          value={view}
          onChange={(event) => {
            const next = CODE_VIEWS.find(
              (option) => option === event.currentTarget.value,
            );
            if (next !== undefined) {
              setView(next);
            }
          }}
        >
          {CODE_VIEWS.map((option) => (
            <option key={option} value={option}>
              {CODE_VIEW_LABELS[option]}
            </option>
          ))}
        </Select>
      </div>
      {view === "pseudocode" ? (
        <PseudocodeLines lines={pseudocode} activeLine={activeLine} />
      ) : (
        <SourceCodeBlock lines={sourceCode[view]} />
      )}
    </section>
  );
}

type PseudocodeLinesProps = {
  lines: readonly string[];
  activeLine?: number;
};

function PseudocodeLines({ lines, activeLine }: PseudocodeLinesProps) {
  return (
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
  );
}

type SourceCodeBlockProps = {
  lines: readonly string[];
};

function SourceCodeBlock({ lines }: SourceCodeBlockProps) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-bg-subtle p-4 font-mono text-sm leading-6 text-text-primary">
      <code>{lines.join("\n")}</code>
    </pre>
  );
}
