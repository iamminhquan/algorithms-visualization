import type { SourceCode } from "@/engine/visualization";
import { BUBBLE_SORT_KEY, BUBBLE_SORT_SOURCE_CODE } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import {
  INSERTION_SORT_KEY,
  INSERTION_SORT_SOURCE_CODE,
} from "./insertion-sort";
import { QUICK_SORT_KEY, QUICK_SORT_SOURCE_CODE } from "./quick-sort";
import {
  SELECTION_SORT_KEY,
  SELECTION_SORT_SOURCE_CODE,
} from "./selection-sort";

export const SORTING_SOURCE_CODES = {
  [BUBBLE_SORT_KEY]: BUBBLE_SORT_SOURCE_CODE,
  [SELECTION_SORT_KEY]: SELECTION_SORT_SOURCE_CODE,
  [INSERTION_SORT_KEY]: INSERTION_SORT_SOURCE_CODE,
  [QUICK_SORT_KEY]: QUICK_SORT_SOURCE_CODE,
} satisfies Record<SortingAlgorithm["metadata"]["key"], SourceCode>;
