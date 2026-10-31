import {
  Bubbles,
  ChartNoAxesColumn,
  type LucideIcon,
  MousePointerClick,
  ScanLine,
  SquareSplitHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AlgorithmKey } from "../catalog";

/*
 * Khai báo bằng `satisfies Record<AlgorithmKey, ...>` để thêm thuật toán mới mà quên chọn icon thì
 * `tsc` báo lỗi. Icon bám theo chính tên thuật toán: nổi bọt (bong bóng), chọn (bấm chọn),
 * tuyến tính (quét lần lượt) và nhị phân (chia đôi).
 */
const ALGORITHM_ICONS = {
  "bubble-sort": Bubbles,
  "selection-sort": MousePointerClick,
  "linear-search": ScanLine,
  "binary-search": SquareSplitHorizontal,
} satisfies Record<AlgorithmKey, LucideIcon>;

const ICON_BY_KEY: ReadonlyMap<string, LucideIcon> = new Map(
  Object.entries(ALGORITHM_ICONS),
);

const SIZE_CLASS_NAMES = {
  sm: { box: "size-8 rounded-md", icon: "size-4" },
  md: { box: "size-12 rounded-lg", icon: "size-6" },
} as const;

type AlgorithmIconProps = {
  algorithmKey: string;
  size?: keyof typeof SIZE_CLASS_NAMES;
};

/** Ô vuông bo góc chứa icon minh hoạ, trang trí nên ẩn khỏi trình đọc màn hình. */
export function AlgorithmIcon({
  algorithmKey,
  size = "md",
}: AlgorithmIconProps) {
  const Icon = ICON_BY_KEY.get(algorithmKey) ?? ChartNoAxesColumn;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center bg-accent-subtle text-accent-text",
        SIZE_CLASS_NAMES[size].box,
      )}
    >
      <Icon className={SIZE_CLASS_NAMES[size].icon} />
    </span>
  );
}
