import type { SourceCode } from "@/engine/visualization";
import { BUBBLE_SORT_KEY, BUBBLE_SORT_SOURCE_CODE } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import {
  SELECTION_SORT_KEY,
  SELECTION_SORT_SOURCE_CODE,
} from "./selection-sort";

export const SORTING_SOURCE_CODES = {
  [BUBBLE_SORT_KEY]: BUBBLE_SORT_SOURCE_CODE,
  [SELECTION_SORT_KEY]: SELECTION_SORT_SOURCE_CODE,
} satisfies Record<SortingAlgorithm["metadata"]["key"], SourceCode>;
