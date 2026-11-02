import { DISPLAY_MAX_LENGTH } from "@/engine/visualization";
import { MAX_INPUT_LENGTH as BUBBLE_SORT_MAX_LENGTH } from "./bubble-sort";
import { MAX_INPUT_LENGTH as INSERTION_SORT_MAX_LENGTH } from "./insertion-sort";
import { MAX_INPUT_LENGTH as MERGE_SORT_MAX_LENGTH } from "./merge-sort";
import { MAX_INPUT_LENGTH as QUICK_SORT_MAX_LENGTH } from "./quick-sort";
import { MAX_INPUT_LENGTH as SELECTION_SORT_MAX_LENGTH } from "./selection-sort";

export const MAX_ARRAY_LENGTH = Math.min(
  DISPLAY_MAX_LENGTH,
  BUBBLE_SORT_MAX_LENGTH,
  SELECTION_SORT_MAX_LENGTH,
  INSERTION_SORT_MAX_LENGTH,
  QUICK_SORT_MAX_LENGTH,
  MERGE_SORT_MAX_LENGTH,
);
