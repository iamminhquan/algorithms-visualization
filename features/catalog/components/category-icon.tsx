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
import type { CategorySlug } from "../categories";

/*
 * Màu icon lấy đúng màu nhấn trong hình minh hoạ card của danh mục đó trên trang chủ.
 */
const CATEGORY_ICONS = {
  sorting: { Icon: ArrowDownWideNarrow, className: "text-state-swap" },
  "data-structures": { Icon: Layers, className: "text-state-pointer" },
  searching: { Icon: ScanSearch, className: "text-state-pointer" },
  "core-concepts": { Icon: Lightbulb, className: "text-state-sorted" },
  graphs: { Icon: Waypoints, className: "text-state-sorted" },
  trees: { Icon: Network, className: "text-state-compare" },
} satisfies Record<CategorySlug, { Icon: LucideIcon; className: string }>;

const SIZE_CLASS_NAMES = {
  sm: { box: "size-7 rounded-md", icon: "size-4" },
  md: { box: "size-9 rounded-lg", icon: "size-4.5" },
} as const;

type CategoryIconProps = {
  slug: CategorySlug;
  size?: keyof typeof SIZE_CLASS_NAMES;
};

/**
 * Ô vuông bo góc chứa icon của danh mục, trang trí nên ẩn khỏi trình đọc màn hình.
 */
export function CategoryIcon({ slug, size = "md" }: CategoryIconProps) {
  const { Icon, className: toneClassName } = CATEGORY_ICONS[slug];
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
