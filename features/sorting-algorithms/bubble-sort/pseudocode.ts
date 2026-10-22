import type { IPseudocode } from "@/engine/visualization";
import type { BubbleSortStep } from "./types";

export const BUBBLE_SORT_PSEUDOCODE: IPseudocode<BubbleSortStep> = {
  lines: [
    "lặp khi đoạn chưa sắp xếp còn từ 2 phần tử",
    "  với mỗi cặp kề nhau a[i], a[i + 1] trong đoạn",
    "    nếu a[i] > a[i + 1]",
    "      hoán đổi a[i] và a[i + 1]",
    "  nếu cả lượt không có hoán đổi: dừng, đoạn còn lại đã đúng thứ tự",
    "  phần tử cuối đoạn đã vào đúng vị trí",
    "hoàn tất",
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
