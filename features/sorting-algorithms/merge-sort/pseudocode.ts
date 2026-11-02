import type { IPseudocode } from "@/engine/visualization";
import type { MergeSortStep } from "./types";

export const MERGE_SORT_PSEUDOCODE: IPseudocode<MergeSortStep> = {
  lines: [
    "hàm merge_sort(lo, hi)",
    "  nếu lo >= hi: trả về",
    "  mid = ⌊(lo + hi) / 2⌋",
    "  merge_sort(lo, mid)",
    "  merge_sort(mid + 1, hi)",
    "  left = a[lo..mid], right = a[mid + 1..hi], i = 0, j = 0",
    "  lặp k từ lo đến hi",
    "    nếu hết right hoặc (còn left và left[i] <= right[j])",
    "      a[k] = left[i], i = i + 1",
    "    ngược lại",
    "      a[k] = right[j], j = j + 1",
    "merge_sort(0, n - 1)",
    "a[0..n - 1] đã được sắp xếp",
    "kết thúc",
  ],
  getActiveLine(step) {
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
  },
};
