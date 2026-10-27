import { DISPLAY_MAX_LENGTH } from "@/engine/visualization";
import { MAX_INPUT_LENGTH as BUBBLE_SORT_MAX_LENGTH } from "./bubble-sort";
import { MAX_INPUT_LENGTH as SELECTION_SORT_MAX_LENGTH } from "./selection-sort";

export const MAX_ARRAY_LENGTH = Math.min(
  DISPLAY_MAX_LENGTH,
  BUBBLE_SORT_MAX_LENGTH,
  SELECTION_SORT_MAX_LENGTH,
);

export const DEFAULT_ARRAY: readonly number[] = Object.freeze([
  38, 27, 43, 3, 9, 82, 10, 55, 19, 64,
]);
