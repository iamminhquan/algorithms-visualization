import type { IPseudocode } from "@/engine/visualization";
import type { SelectionSortStep } from "./types";

export const SELECTION_SORT_PSEUDOCODE: IPseudocode<SelectionSortStep> = {
  lines: [
    "với i từ 0 tới n − 2",
    "  min ← i",
    "  với j từ i + 1 tới n − 1",
    "    nếu a[j] < a[min]: min ← j",
    "  nếu min ≠ i: hoán đổi a[i] và a[min]",
    "  a[i] đã vào đúng vị trí",
    "hoàn tất",
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
