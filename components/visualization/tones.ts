import type { VisualTone } from "@/engine/visualization";

export const TONE_BACKGROUND: Readonly<Record<VisualTone, string>> = {
  default: "bg-state-default",
  compare: "bg-state-compare",
  swap: "bg-state-swap",
  pivot: "bg-state-pivot",
  pointer: "bg-state-pointer",
  sorted: "bg-state-sorted",
  discarded: "bg-state-discarded",
  found: "bg-state-found",
};

export const TONE_BORDER: Readonly<Record<VisualTone, string>> = {
  default: "border-state-default",
  compare: "border-state-compare",
  swap: "border-state-swap",
  pivot: "border-state-pivot",
  pointer: "border-state-pointer",
  sorted: "border-state-sorted",
  discarded: "border-state-discarded",
  found: "border-state-found",
};
