import type { VisualTone } from "@/engine/visualization";
import { cn } from "@/lib/cn";
import { TONE_BACKGROUND } from "./tones";

export interface ILegendItem {
  readonly tone: VisualTone;
  readonly label: string;
}

type LegendListProps = {
  items: readonly ILegendItem[];
  className?: string;
};

export function LegendList({ items, className }: LegendListProps) {
  return (
    <ul
      aria-label="Chú giải màu"
      className={cn(
        "flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.tone} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-3 rounded-sm", TONE_BACKGROUND[item.tone])}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
