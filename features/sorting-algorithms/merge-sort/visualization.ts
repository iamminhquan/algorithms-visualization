import type { IBarMarker } from "@/components/visualization/array-bars";
import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import { elementAt, type IVariable } from "@/engine/visualization";
import { getBaseFrame, type ISortingFrame } from "../visualization";
import type { MergeSortEvent, MergeSortStep } from "./types";

export const MERGE_SORT_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa trộn" },
  { tone: "pointer", label: "Khung: đoạn a[lo..hi] đang trộn, k: ô đang ghi" },
  { tone: "compare", label: "i, j: đầu nửa trái left và nửa phải right" },
  { tone: "swap", label: "Đang ghi vào a[k]" },
  { tone: "sorted", label: "Đã sắp xếp xong" },
];

function createMarkers(
  length: number,
  pointers: readonly (IBarMarker & { readonly index: number })[],
): IBarMarker[][] {
  const markers: IBarMarker[][] = Array.from({ length }, () => []);
  for (const { index, label, tone } of pointers) {
    markers[index].push({ label, tone });
  }
  return markers;
}

export function getMergeSortFrame(event: MergeSortEvent): ISortingFrame {
  const frame = getBaseFrame(event);
  const { payload, state } = event;
  const { length } = state.array;

  switch (payload.type) {
    case "compare": {
      const [left, right] = payload.indices;
      const isLeftFirst = state.array[left] <= state.array[right];
      return {
        ...frame,
        markers: createMarkers(length, [
          { index: left, label: "k", tone: "pointer" },
          { index: left, label: "i", tone: "compare" },
          { index: right, label: "j", tone: "compare" },
        ]),
        bracket: {
          from: left,
          to: right,
          label: `${state.array[left]} ${isLeftFirst ? "≤" : ">"} ${state.array[right]}`,
          tone: "compare",
        },
        range: { from: payload.lo, to: payload.hi },
      };
    }
    case "write":
      return {
        ...frame,
        markers: createMarkers(length, [
          { index: payload.to, label: "k", tone: "pointer" },
        ]),
        bracket: {
          from: payload.to,
          to: payload.to,
          label: payload.side === "left" ? "a[k] = left[i]" : "a[k] = right[j]",
          tone: "swap",
        },
        range: { from: payload.lo, to: payload.hi },
      };
    case "mark-sorted":
    case "complete":
      return frame;
    default: {
      const unreachable: never = payload;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}

export function getMergeSortVariables(
  event: MergeSortEvent,
): readonly IVariable[] {
  const { payload, state } = event;
  let lo: number | undefined;
  let mid: number | undefined;
  let hi: number | undefined;
  let i: number | undefined;
  let j: number | undefined;
  let k: number | undefined;
  let leftPosition: number | undefined;
  let rightPosition: number | undefined;

  switch (payload.type) {
    case "compare":
      ({ lo, mid, hi, i, j } = payload);
      [leftPosition, rightPosition] = payload.indices;
      k = leftPosition;
      break;
    case "write": {
      ({ lo, mid, hi, i, j } = payload);
      k = payload.to;
      const hasLeft = i <= mid - lo;
      const hasRight = j < hi - mid;
      if (payload.side === "left") {
        leftPosition = k;
        rightPosition = hasRight ? mid + 1 + j : undefined;
      } else {
        leftPosition = hasLeft ? k + 1 : undefined;
        rightPosition = k;
      }
      break;
    }
    case "mark-sorted":
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
    { name: "mid", value: mid },
    { name: "hi", value: hi },
    { name: "k", value: k },
    { name: "i", value: i },
    { name: "j", value: j },
    { name: "left[i]", value: elementAt(state.array, leftPosition) },
    { name: "right[j]", value: elementAt(state.array, rightPosition) },
  ];
}

export function getMergeSortActiveLine(
  step: MergeSortStep,
): number | undefined {
  switch (step.type) {
    case "compare":
      return 7;
    case "write":
      return step.side === "left" ? 8 : 10;
    case "mark-sorted":
      return 12;
    case "complete":
      return 13;
    default: {
      const unreachable: never = step;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}
