import type { IPseudocode } from "@/engine/visualization";
import type { InsertionSortStep } from "./types";

export const INSERTION_SORT_PSEUDOCODE: IPseudocode<InsertionSortStep> = {
  lines: [
    "lặp i từ 0 đến n - 1",
    "  lặp j từ i giảm về 1",
    "    nếu a[j - 1] <= a[j]: dừng lặp j",
    "    hoán đổi a[j - 1], a[j]",
    "  a[0..i] đã được sắp xếp",
    "kết thúc",
  ],
  getActiveLine(step) {
    switch (step.type) {
      case "compare":
        return 2;
      case "swap":
        return 3;
      case "mark-sorted":
        return 4;
      case "complete":
        return 5;
      default: {
        const unreachable: never = step;
        throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }
  },
};
