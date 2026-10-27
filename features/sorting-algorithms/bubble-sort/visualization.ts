import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import { getBaseFrame, type ISortingFrame } from "../visualization";
import type { BubbleSortEvent } from "./types";

export const BUBBLE_SORT_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa sắp xếp" },
  { tone: "compare", label: "Đang so sánh" },
  { tone: "swap", label: "Đang hoán đổi" },
  { tone: "sorted", label: "Đã đúng vị trí" },
];

/**
 * Frame của Bubble Sort tại thời điểm sự kiện đó xảy ra.
 */
export function getBubbleSortFrame(event: BubbleSortEvent): ISortingFrame {
  const frame = getBaseFrame(event);
  const { payload, state } = event;

  switch (payload.type) {
    case "compare": {
      const [left, right] = payload.indices;
      const outOfOrder = state.array[left] > state.array[right];
      return {
        ...frame,
        bracket: {
          from: left,
          to: right,
          label: `${state.array[left]} ${outOfOrder ? ">" : "≤"} ${state.array[right]}`,
          tone: "compare",
        },
      };
    }
    case "swap": {
      const [left, right] = payload.indices;
      return {
        ...frame,
        bracket: { from: left, to: right, label: "Hoán đổi", tone: "swap" },
      };
    }
    case "mark-sorted":
    case "complete":
      return frame;
    default: {
      const unreachable: never = payload;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}
