import type { IPseudocode } from "@/engine/visualization";
import type { LinearSearchStep } from "./types";

export const LINEAR_SEARCH_PSEUDOCODE: IPseudocode<LinearSearchStep> = {
  lines: [
    "for i from 0 to n - 1",
    "  if a[i] == key",
    "    found at i, stop",
    "not found",
    "done",
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
