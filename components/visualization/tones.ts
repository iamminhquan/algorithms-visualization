import type { VisualTone } from "@/engine/visualization";

export const TONE_BACKGROUND: Readonly<Record<VisualTone, string>> = {
  default: "bg-state-default",
  compare: "bg-state-compare",
  swap: "bg-state-swap",
  pivot: "bg-state-pivot",
  pointer: "bg-state-pointer",
  sorted: "bg-state-sorted",
};
