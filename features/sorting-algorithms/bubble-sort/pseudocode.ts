import type { IPseudocode } from "@/engine/visualization";
import type { BubbleSortStep } from "./types";

export const BUBBLE_SORT_PSEUDOCODE: IPseudocode<BubbleSortStep> = {
  lines: [
    "for end from n - 1 down to 1",
    "  for i from 0 to end - 1",
    "    if a[i] > a[i + 1]",
    "      swap a[i], a[i + 1]",
    "  if no swap: rest is sorted, stop",
    "  a[end] is sorted",
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
