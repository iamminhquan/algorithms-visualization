import type { IPseudocode } from "@/engine/visualization";
import type { QuickSortStep } from "./types";

export const QUICK_SORT_PSEUDOCODE: IPseudocode<QuickSortStep> = {
  lines: [
    "hàm quick_sort(lo, hi)",
    "  nếu lo > hi: trả về",
    "  pivot = a[hi], i = lo - 1",
    "  lặp j từ lo đến hi - 1",
    "    nếu a[j] <= pivot",
    "      i = i + 1, hoán đổi a[i], a[j]",
    "  hoán đổi a[i + 1], a[hi]",
    "  p = i + 1, a[p] đã đúng vị trí",
    "  quick_sort(lo, p - 1)",
    "  quick_sort(p + 1, hi)",
    "quick_sort(0, n - 1)",
    "kết thúc",
  ],
  getActiveLine(step) {
    switch (step.type) {
      case "compare":
        return 4;
      case "swap":
        return step.indices[1] === step.hi ? 6 : 5;
      case "mark-sorted":
        return 7;
      case "complete":
        return 11;
      default: {
        const unreachable: never = step;
        throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }
  },
};
