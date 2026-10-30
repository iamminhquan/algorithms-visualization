import type { IBarMarker } from "@/components/visualization/array-bars";
import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import {
  elementAt,
  type IVariable,
  type VisualTone,
} from "@/engine/visualization";
import { getBaseFrame, type ISortingFrame } from "../visualization";
import type { SelectionSortEvent } from "./types";

export const SELECTION_SORT_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa sắp xếp" },
  { tone: "pointer", label: "i: đầu đoạn chưa sắp xếp" },
  { tone: "pivot", label: "min: giá trị nhỏ nhất hiện tại" },
  { tone: "compare", label: "j: đang so sánh" },
  { tone: "swap", label: "Đang hoán đổi" },
  { tone: "sorted", label: "Đã đúng vị trí" },
];

/**
 * Hình của Selection Sort ở một bước. Khi so sánh: huy hiệu `i`, `min`, `j` trên đúng cột và ngoặc
 * từ `min` tới `j` ghi `a[j] < a[min]` hay không; khi hoán đổi: ngoặc từ `i` tới `min`.
 *
 * @param event Sự kiện đang xem.
 * @returns Hình cần vẽ.
 */
export function getSelectionSortFrame(
  event: SelectionSortEvent,
): ISortingFrame {
  const frame = getBaseFrame(event);
  const { payload, state } = event;

  switch (payload.type) {
    case "compare": {
      const [minIndex, current] = payload.indices;
      /*
       * Phần đã sắp xếp luôn là `0..i-1`, nên độ dài của nó chính là `i`.
       */
      const start = state.sortedIndices.length;
      const tones: VisualTone[] = [...frame.tones];
      tones[minIndex] = "pivot";
      tones[current] = "compare";

      const markers: IBarMarker[][] = frame.markers.map(() => []);
      markers[start].push({ label: "i", tone: "pointer" });
      markers[minIndex].push({ label: "min", tone: "pivot" });
      markers[current].push({ label: "j", tone: "compare" });

      const isSmaller = state.array[current] < state.array[minIndex];
      return {
        tones,
        markers,
        bracket: {
          from: minIndex,
          to: current,
          label: `${state.array[current]} ${isSmaller ? "<" : "≥"} ${state.array[minIndex]}`,
          tone: "compare",
        },
      };
    }
    case "swap": {
      const [start, minIndex] = payload.indices;
      return {
        ...frame,
        bracket: { from: start, to: minIndex, label: "Hoán đổi", tone: "swap" },
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

export function getSelectionSortVariables(
  event: SelectionSortEvent,
): readonly IVariable[] {
  const { payload, state } = event;
  let i: number | undefined;
  let min: number | undefined;
  let j: number | undefined;

  switch (payload.type) {
    case "compare":
      i = state.sortedIndices.length;
      [min, j] = payload.indices;
      break;
    case "swap":
      [i, min] = payload.indices;
      break;
    case "mark-sorted":
      i = payload.indices[0];
      break;
    case "complete":
      break;
    default: {
      const unreachable: never = payload;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }

  return [
    { name: "n", value: state.array.length },
    { name: "i", value: i },
    { name: "min", value: min },
    { name: "j", value: j },
    { name: "a[j]", value: elementAt(state.array, j) },
    { name: "a[min]", value: elementAt(state.array, min) },
  ];
}
