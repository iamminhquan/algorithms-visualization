import {
  ArrowDownWideNarrow,
  Layers,
  Lightbulb,
  type LucideIcon,
  Network,
  ScanSearch,
  Waypoints,
} from "lucide-react";
import { cn } from "@/lib/cn";

const CATEGORY_ICONS: Readonly<
  Record<string, { readonly Icon: LucideIcon; readonly className: string }>
> = {
  sorting: { Icon: ArrowDownWideNarrow, className: "text-state-swap" },
  "data-structures": { Icon: Layers, className: "text-state-pointer" },
  searching: { Icon: ScanSearch, className: "text-state-pointer" },
  "core-concepts": { Icon: Lightbulb, className: "text-state-sorted" },
  graphs: { Icon: Waypoints, className: "text-state-sorted" },
  trees: { Icon: Network, className: "text-state-compare" },
};

const DEFAULT_CATEGORY_ICON = {
  Icon: Layers,
  className: "text-text-muted",
} as const;

const SIZE_CLASS_NAMES = {
  sm: { box: "size-7 rounded-md", icon: "size-4" },
  md: { box: "size-9 rounded-lg", icon: "size-4.5" },
} as const;

type CategoryIconProps = {
  slug: string;
  size?: keyof typeof SIZE_CLASS_NAMES;
};

export function CategoryIcon({ slug, size = "md" }: CategoryIconProps) {
  const { Icon, className: toneClassName } =
    CATEGORY_ICONS[slug] ?? DEFAULT_CATEGORY_ICON;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center bg-bg-subtle",
        SIZE_CLASS_NAMES[size].box,
        toneClassName,
      )}
    >
      <Icon className={SIZE_CLASS_NAMES[size].icon} />
    </span>
  );
}
