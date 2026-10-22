import type { IPseudocode } from "@/engine/visualization";
import type { BubbleSortStep } from "./types";

export const BUBBLE_SORT_PSEUDOCODE: IPseudocode<BubbleSortStep> = {
  lines: [
    "while the unsorted range has at least 2 elements",
    "  for each adjacent pair a[i], a[i + 1] in the range",
    "    if a[i] > a[i + 1]",
    "      swap a[i] and a[i + 1]",
    "  if the whole pass made no swap: stop, the rest is already sorted",
    "  the last element of the range is now sorted",
    "done",
  ],
  getActiveLine(step) {
    switch (step.type) {
      case "compare":
        return 2;
      case "swap":
        return 3;
      case "mark-sorted":
        /*
         * Chỉ lần dừng sớm mới chốt nhiều phần tử cùng lúc; cuối mỗi lượt chỉ chốt một phần tử.
         */
        return step.indices.length > 1 ? 4 : 5;
      case "complete":
        return 6;
      default: {
        const unreachable: never = step;
        throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }
  },
};
