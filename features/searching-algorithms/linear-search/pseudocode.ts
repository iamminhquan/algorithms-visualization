import type { IPseudocode } from "@/engine/visualization";
import type { LinearSearchStep } from "./types";

export const LINEAR_SEARCH_PSEUDOCODE: IPseudocode<LinearSearchStep> = {
  lines: [
    "lặp i từ 0 đến n - 1",
    "  nếu a[i] == key",
    "    tìm thấy tại i, dừng",
    "không tìm thấy",
    "kết thúc",
  ],
  getActiveLine(step) {
    switch (step.type) {
      case "compare":
        return 1;
      case "found":
        return 2;
      case "not-found":
        return 3;
      default: {
        const unreachable: never = step;
        throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }
  },
};
