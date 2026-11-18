import type { IBarMarker } from "@/components/visualization/array-bars";
import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import type { IVariable, VisualTone } from "@/engine/visualization";
import { getBaseFrame, type ISortingFrame } from "../visualization";
import type { QuickSortEvent, QuickSortStep } from "./types";

export const QUICK_SORT_LEGEND: readonly ILegendItem[] = [
  { tone: "default", label: "Chưa sắp xếp" },
  { tone: "pointer", label: "Vị trí đang xét" },
  { tone: "pivot", label: "Pivot" },
  { tone: "compare", label: "Đang so sánh" },
  { tone: "swap", label: "Đang hoán đổi" },
  { tone: "sorted", label: "Đã sắp xếp" },
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

function createCaptions(
  length: number,
  index: number,
  label: string,
): readonly (string | undefined)[] {
  const captions: (string | undefined)[] = Array.from(
    { length },
    () => undefined,
  );
  if (index >= 0 && index < length) {
    captions[index] = label;
  }
  return captions;
}

export function getQuickSortFrame(event: QuickSortEvent): ISortingFrame {
  const frame = getBaseFrame(event);
  const { payload, state } = event;
  const { length } = state.array;

  switch (payload.type) {
    case "compare": {
      const { lo, hi, i, j, pivot, side, mid } = payload;
      const tones: VisualTone[] = [...frame.tones];
      if (mid >= 0 && mid < length) tones[mid] = "pivot";
      if (side === "ij") {
        const inRange = i >= 0 && i < length;
        const jnRange = j >= 0 && j < length;
        if (inRange) tones[i] = "compare";
        if (jnRange) tones[j] = "compare";
        return {
          tones,
          markers: createMarkers(length, [
            { index: i, label: "i", tone: "pointer" },
            { index: j, label: "j", tone: "pointer" },
            { index: mid, label: "pivot", tone: "pivot" },
          ]),
          captions: createCaptions(length, mid, "pivot"),
          bracket: {
            from: Math.min(i, j),
            to: Math.max(i, j),
            label: `${i} ${i <= j ? "≤" : ">"} ${j}`,
            tone: "compare",
          },
          range: { from: lo, to: hi },
        };
      }
      if (side === "left-j" || side === "i-right") {
        const left = side === "left-j" ? lo : i;
        const right = side === "left-j" ? j : hi;
        return {
          tones,
          markers: createMarkers(length, [
            { index: i, label: "i", tone: "pointer" },
            { index: j, label: "j", tone: "pointer" },
            { index: mid, label: "pivot", tone: "pivot" },
          ]),
          captions: createCaptions(length, mid, "pivot"),
          bracket: {
            from: Math.min(left, right),
            to: Math.max(left, right),
            label: `${left} ${left < right ? "<" : "≥"} ${right}`,
            tone: "compare",
          },
          range: { from: lo, to: hi },
        };
      }
      const current = side === "i" ? i : j;
      if (current >= 0 && current < length) tones[current] = "compare";
      return {
        tones,
        markers: createMarkers(length, [
          { index: i, label: "i", tone: "pointer" },
          { index: j, label: "j", tone: "pointer" },
          { index: mid, label: "pivot", tone: "pivot" },
        ]),
        captions: createCaptions(length, mid, "pivot"),
        bracket: {
          from: Math.min(current, mid),
          to: Math.max(current, mid),
          label: `${state.array[current]} ${
            state.array[current] < pivot
              ? "<"
              : state.array[current] > pivot
                ? ">"
                : "="
          } ${pivot}`,
          tone: "compare",
        },
        range: { from: lo, to: hi },
      };
    }
    case "swap": {
      const [left, right] = payload.indices;
      const { lo, hi, i, j, mid } = payload;
      const tones: VisualTone[] = [...frame.tones];
      if (mid >= 0 && mid < length) tones[mid] = "pivot";
      if (left >= 0 && left < length) tones[left] = "swap";
      if (right >= 0 && right < length) tones[right] = "swap";
      return {
        tones,
        markers: createMarkers(length, [
          { index: i, label: "i", tone: "pointer" },
          { index: j, label: "j", tone: "pointer" },
          { index: mid, label: "pivot", tone: "pivot" },
        ]),
        captions: createCaptions(length, mid, "pivot"),
        bracket: {
          from: Math.min(left, right),
          to: Math.max(left, right),
          label: "Hoán đổi",
          tone: "swap",
        },
        range: { from: lo, to: hi },
      };
    }
    case "recurse": {
      const { lo, hi, i, j, mid, side } = payload;
      const from = side === "left" ? lo : i;
      const to = side === "left" ? j : hi;
      return {
        ...frame,
        markers: createMarkers(length, [
          { index: i, label: "i", tone: "pointer" },
          { index: j, label: "j", tone: "pointer" },
          { index: mid, label: "pivot", tone: "pivot" },
        ]),
        captions: createCaptions(length, mid, "pivot"),
        range: { from, to },
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
  let mid: number | undefined;

  switch (payload.type) {
    case "compare":
    case "swap":
    case "recurse": {
      ({ lo, hi, i, j, pivot, mid } = payload);
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
    { name: "left", value: lo },
    { name: "right", value: hi },
    { name: "pivot", value: pivot },
    { name: "i", value: i },
    { name: "j", value: j },
    { name: "mid", value: mid },
  ];
}

export function getQuickSortActiveLine(
  step: QuickSortStep,
): number | undefined {
  switch (step.type) {
    case "compare":
      switch (step.side) {
        case "i":
          return 9;
        case "j":
          return 11;
        case "ij":
          return 13;
        case "left-j":
          return 18;
        case "i-right":
          return 19;
      }
      break;
    case "recurse":
      return step.side === "left" ? 18 : 19;
    case "swap":
      return 14;
    case "mark-sorted":
      return 3;
    case "complete":
      return 21;
    default: {
      const unreachable: never = step;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}

export function getQuickSortSourceActiveLine(
  step: QuickSortStep,
): number | undefined {
  // C++ snippet (user-provided) line numbers
  // 1 void quick_sort...
  // ...
  // We'll map loosely; source highlighting less critical.
  switch (step.type) {
    case "compare":
      switch (step.side) {
        case "i":
          return 8;
        case "j":
          return 9;
        case "ij":
          return 11;
        case "left-j":
          return 18;
        case "i-right":
          return 22;
      }
      break;
    case "recurse":
      return step.side === "left" ? 19 : 23;
    case "swap":
      return 12;
    case "mark-sorted":
      return 1;
    case "complete":
      return 25;
    default: {
      const unreachable: never = step;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}
