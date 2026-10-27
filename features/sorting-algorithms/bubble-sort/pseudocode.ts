import type { IPseudocode } from "@/engine/visualization";
import type { BubbleSortStep } from "./types";

export const BUBBLE_SORT_PSEUDOCODE: IPseudocode<BubbleSortStep> = {
  lines: [
    "lặp end từ n - 1 giảm về 1",
    "  lặp i từ 0 đến end - 1",
    "    nếu a[i] > a[i + 1]",
    "      hoán đổi a[i], a[i + 1]",
    "  nếu không có hoán đổi: phần còn lại đã đúng thứ tự, dừng",
    "  a[end] đã đúng vị trí",
    "kết thúc",
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
