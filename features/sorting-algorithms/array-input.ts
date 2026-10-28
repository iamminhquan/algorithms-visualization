import { DISPLAY_MAX_LENGTH } from "@/engine/visualization";
import { MAX_INPUT_LENGTH as BUBBLE_SORT_MAX_LENGTH } from "./bubble-sort";
import { MAX_INPUT_LENGTH as SELECTION_SORT_MAX_LENGTH } from "./selection-sort";

export const MAX_ARRAY_LENGTH = Math.min(
  DISPLAY_MAX_LENGTH,
  BUBBLE_SORT_MAX_LENGTH,
  SELECTION_SORT_MAX_LENGTH,
);
