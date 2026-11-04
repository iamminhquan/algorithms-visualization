import type { IBarMarker } from "@/components/visualization/array-bars";
import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import {
  elementAt,
  type IVariable,
  type VisualTone,
} from "@/engine/visualization";
import { getBaseFrame, type ISortingFrame } from "../visualization";
import type { QuickSortEvent } from "./types";

export const QUICK_SORT_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa sắp xếp" },
  {
    tone: "pointer",
    label: "Khung: đoạn a[lo..hi], i: cuối vùng nhỏ hơn hoặc bằng pivot",
  },
  { tone: "pivot", label: "pivot: phần tử cuối đoạn" },
  { tone: "compare", label: "j: đang so sánh với pivot" },
  { tone: "swap", label: "Đang hoán đổi" },
  { tone: "sorted", label: "Đã đúng vị trí" },
];

function createMarkers(
  length: number,
  pointers: readonly (IBarMarker & { readonly index: number })[],
): IBarMarker[][] {
  const markers: IBarMarker[][] = Array.from({ length }, () => []);
  for (const { index, label, tone } of pointers) {
    if (index >= 0 && index < length) {
      markers[index].push({ label, tone });
    }
  }
  return markers;
}

export function getQuickSortFrame(event: QuickSortEvent): ISortingFrame {
  const frame = getBaseFrame(event);
  const { payload, state } = event;
  const { length } = state.array;

  switch (payload.type) {
    case "compare": {
      const [j, hi] = payload.indices;
      const { lo, i } = payload;
      const tones: VisualTone[] = [...frame.tones];
      tones[hi] = "pivot";
      const isSmallerOrEqual = state.array[j] <= state.array[hi];
      return {
        tones,
        markers: createMarkers(length, [
          ...(i >= lo
            ? [{ index: i, label: "i", tone: "pointer" as const }]
            : []),
          { index: j, label: "j", tone: "compare" },
          { index: hi, label: "pivot", tone: "pivot" },
        ]),
        bracket: {
          from: j,
          to: hi,
          label: `${state.array[j]} ${isSmallerOrEqual ? "≤" : ">"} ${state.array[hi]}`,
          tone: "compare",
        },
        range: { from: lo, to: hi },
      };
    }
    case "swap": {
      const [left, right] = payload.indices;
      const { lo, hi } = payload;
      const isPivotSwap = right === hi;
      const tones: VisualTone[] = [...frame.tones];
      if (!isPivotSwap) {
        tones[hi] = "pivot";
      }
      return {
        tones,
        markers: createMarkers(
          length,
          isPivotSwap
            ? [{ index: left, label: "pivot", tone: "pivot" }]
            : [
                { index: left, label: "i", tone: "pointer" },
                { index: right, label: "j", tone: "compare" },
                { index: hi, label: "pivot", tone: "pivot" },
              ],
        ),
        bracket: { from: left, to: right, label: "Hoán đổi", tone: "swap" },
        range: { from: lo, to: hi },
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

export function getQuickSortVariables(
  event: QuickSortEvent,
): readonly IVariable[] {
  const { payload, state } = event;
  let lo: number | undefined;
  let hi: number | undefined;
  let pivot: number | undefined;
  let i: number | undefined;
  let j: number | undefined;
  let p: number | undefined;

  switch (payload.type) {
    case "compare":
      ({ lo, hi, i } = payload);
      j = payload.indices[0];
      pivot = state.array[hi];
      break;
    case "swap": {
      ({ lo, hi, i } = payload);
      const [left, right] = payload.indices;
      if (right === hi) {
        pivot = state.array[left];
      } else {
        j = right;
        pivot = state.array[hi];
      }
      break;
    }
    case "mark-sorted":
      p = payload.indices[0];
      i = p - 1;
      pivot = elementAt(state.array, p);
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
    { name: "lo", value: lo },
    { name: "hi", value: hi },
    { name: "pivot", value: pivot },
    { name: "i", value: i },
    { name: "j", value: j },
    { name: "p", value: p },
  ];
}
