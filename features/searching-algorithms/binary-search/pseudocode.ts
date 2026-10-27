import type { IPseudocode } from "@/engine/visualization";
import type { BinarySearchStep } from "./types";

export const BINARY_SEARCH_PSEUDOCODE: IPseudocode<BinarySearchStep> = {
  lines: [
    "low = 0, high = n - 1",
    "trong khi low <= high",
    "  mid = ⌊(low + high) / 2⌋",
    "  nếu a[mid] == key",
    "    tìm thấy tại mid, dừng",
    "  nếu a[mid] < key",
    "    low = mid + 1",
    "  ngược lại",
    "    high = mid - 1",
    "không tìm thấy",
    "kết thúc",
  ],
  getActiveLine(step) {
    switch (step.type) {
      case "init":
        return 0;
      case "pick-mid":
        return 2;
      case "compare":
        return 3;
      case "found":
        return 4;
      case "narrow":
        return step.keep === "right" ? 6 : 8;
      case "not-found":
        return 9;
      default: {
        const unreachable: never = step;
        throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }
  },
};
