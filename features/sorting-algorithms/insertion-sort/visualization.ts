import type { IBarMarker } from "@/components/visualization/array-bars";
import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import { elementAt, type IVariable } from "@/engine/visualization";
import { getBaseFrame, type ISortingFrame } from "../visualization";
import type { InsertionSortEvent } from "./types";

export const INSERTION_SORT_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa sắp xếp" },
  { tone: "pointer", label: "Đang chèn" },
  { tone: "compare", label: "Đang so sánh" },
  { tone: "swap", label: "Đang hoán đổi" },
  { tone: "sorted", label: "Đã sắp xếp" },
];

function getPointerMarkers(
  event: InsertionSortEvent,
  j: number,
): IBarMarker[][] {
  const markers: IBarMarker[][] = event.state.array.map(() => []);
  markers[event.state.sortedIndices.length].push({
    label: "i",
    tone: "pointer",
  });
  markers[j].push({ label: "j", tone: "compare" });
  return markers;
}

export function getInsertionSortFrame(
  event: InsertionSortEvent,
): ISortingFrame {
  const frame = getBaseFrame(event);
  const { payload, state } = event;

  switch (payload.type) {
    case "compare": {
      const [left, right] = payload.indices;
      const outOfOrder = state.array[left] > state.array[right];
      return {
        ...frame,
        markers: getPointerMarkers(event, right),
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
        markers: getPointerMarkers(event, right),
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

export function getInsertionSortVariables(
  event: InsertionSortEvent,
): readonly IVariable[] {
  const { payload, state } = event;
  let i: number | undefined;
  let j: number | undefined;

  switch (payload.type) {
    case "compare":
    case "swap":
      i = state.sortedIndices.length;
      j = payload.indices[1];
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
    { name: "j", value: j },
    {
      name: "a[j - 1]",
      value: elementAt(state.array, j === undefined ? undefined : j - 1),
    },
    { name: "a[j]", value: elementAt(state.array, j) },
  ];
}
