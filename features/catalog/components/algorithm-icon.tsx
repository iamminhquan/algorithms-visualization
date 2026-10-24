import {
  Bubbles,
  ChartNoAxesColumn,
  type LucideIcon,
  MousePointerClick,
} from "lucide-react";
import type { AlgorithmKey } from "../catalog";

/*
 * Khai báo bằng `satisfies Record<AlgorithmKey, ...>` để thêm thuật toán mới mà quên chọn icon thì
 * `tsc` báo lỗi. Icon bám theo chính tên thuật toán: nổi bọt (bong bóng) và chọn (bấm chọn).
 */
const ALGORITHM_ICONS = {
  "bubble-sort": Bubbles,
  "selection-sort": MousePointerClick,
} satisfies Record<AlgorithmKey, LucideIcon>;

const ICON_BY_KEY: ReadonlyMap<string, LucideIcon> = new Map(
  Object.entries(ALGORITHM_ICONS),
);

type AlgorithmIconProps = {
  algorithmKey: string;
};

/** Ô vuông bo góc chứa icon minh hoạ, trang trí nên ẩn khỏi trình đọc màn hình. */
export function AlgorithmIcon({ algorithmKey }: AlgorithmIconProps) {
  const Icon = ICON_BY_KEY.get(algorithmKey) ?? ChartNoAxesColumn;
  return (
    <span
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent-text"
    >
      <Icon className="size-6" />
    </span>
  );
}
