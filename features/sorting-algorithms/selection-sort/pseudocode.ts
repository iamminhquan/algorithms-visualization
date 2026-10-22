import type { IPseudocode } from "@/engine/visualization";
import type { SelectionSortStep } from "./types";

export const SELECTION_SORT_PSEUDOCODE: IPseudocode<SelectionSortStep> = {
  lines: [
    "for i from 0 to n − 2",
    "  min ← i",
    "  for j from i + 1 to n − 1",
    "    if a[j] < a[min]: min ← j",
    "  if min ≠ i: swap a[i] and a[min]",
    "  a[i] is in its final position",
    "done",
  ],
  getActiveLine(step) {
    switch (step.type) {
      case "compare":
        return 3;
      case "swap":
        return 4;
      case "mark-sorted":
        return 5;
      case "complete":
        return 6;
      default: {
        const unreachable: never = step;
        throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }
  },
};
