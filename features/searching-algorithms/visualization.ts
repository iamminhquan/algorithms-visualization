import type {
  IBarBracket,
  IBarMarker,
  IBarRange,
} from "@/components/visualization/array-bars";
import type { VisualTone } from "@/engine/visualization";
import type { BinarySearchEvent } from "./binary-search";
import type { LinearSearchEvent } from "./linear-search";
import type { ISearchState } from "./types";

export type SearchingEvent = LinearSearchEvent | BinarySearchEvent;

export interface ISearchingFrame {
  readonly tones: readonly VisualTone[];
  readonly markers: readonly (readonly IBarMarker[])[];
  readonly bracket?: IBarBracket;
  readonly range?: IBarRange;
}

export function getBaseFrame(state: ISearchState): ISearchingFrame {
  return {
    tones: state.array.map((_, index) =>
      index < state.low || index > state.high ? "discarded" : "default",
    ),
    markers: state.array.map(() => []),
  };
}

export function getRemainingCount(state: ISearchState): number {
  return Math.max(0, state.high - state.low + 1);
}

export interface IPointer {
  readonly label: string;
  readonly index: number;
}

export function createPointerMarkers(
  length: number,
  pointers: readonly IPointer[],
): readonly (readonly IBarMarker[])[] {
  const labels: string[][] = Array.from({ length }, () => []);
  for (const { label, index } of pointers) {
    if (index >= 0 && index < length) {
      labels[index].push(label);
    }
  }
  return labels.map((group) =>
    group.length === 0 ? [] : [{ label: group.join("·"), tone: "pointer" }],
  );
}
