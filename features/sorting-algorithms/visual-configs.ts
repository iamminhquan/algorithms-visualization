import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import type { IVariable } from "@/engine/visualization";
import {
  BUBBLE_SORT_KEY,
  BUBBLE_SORT_LEGEND,
  bubbleSort,
  getBubbleSortActiveLine,
  getBubbleSortFrame,
  getBubbleSortSourceActiveLine,
  getBubbleSortVariables,
} from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import {
  getInsertionSortActiveLine,
  getInsertionSortFrame,
  getInsertionSortSourceActiveLine,
  getInsertionSortVariables,
  INSERTION_SORT_KEY,
  INSERTION_SORT_LEGEND,
  insertionSort,
} from "./insertion-sort";
import {
  getMergeSortActiveLine,
  getMergeSortFrame,
  getMergeSortSourceActiveLine,
  getMergeSortVariables,
  MERGE_SORT_KEY,
  MERGE_SORT_LEGEND,
  mergeSort,
} from "./merge-sort";
import {
  getQuickSortActiveLine,
  getQuickSortFrame,
  getQuickSortSourceActiveLine,
  getQuickSortVariables,
  QUICK_SORT_KEY,
  QUICK_SORT_LEGEND,
  quickSort,
} from "./quick-sort";
import type { SortingCounter } from "./run";
import {
  getSelectionSortActiveLine,
  getSelectionSortFrame,
  getSelectionSortSourceActiveLine,
  getSelectionSortVariables,
  SELECTION_SORT_KEY,
  SELECTION_SORT_LEGEND,
  selectionSort,
} from "./selection-sort";
import type { ISortingFrame, SortingEvent } from "./visualization";

export interface ISortingVisualConfig {
  readonly algorithm: SortingAlgorithm;
  getActiveLine(step: SortingEvent["payload"]): number | undefined;
  getSourceActiveLine?(step: SortingEvent["payload"]): number | undefined;
  getFrame(event: SortingEvent): ISortingFrame;
  getVariables(event: SortingEvent): readonly IVariable[];
  readonly legend: readonly ILegendItem[];
  readonly counters: readonly SortingCounter[];
}

const SWAP_COUNTERS: readonly SortingCounter[] = ["compare", "swap"];

const WRITE_COUNTERS: readonly SortingCounter[] = ["compare", "write"];

export const SORTING_VISUAL_CONFIGS = {
  [BUBBLE_SORT_KEY]: {
    algorithm: bubbleSort,
    getActiveLine: getBubbleSortActiveLine,
    getSourceActiveLine: getBubbleSortSourceActiveLine,
    getFrame: getBubbleSortFrame,
    getVariables: getBubbleSortVariables,
    legend: BUBBLE_SORT_LEGEND,
    counters: SWAP_COUNTERS,
  },
  [SELECTION_SORT_KEY]: {
    algorithm: selectionSort,
    getActiveLine: getSelectionSortActiveLine,
    getSourceActiveLine: getSelectionSortSourceActiveLine,
    getFrame: getSelectionSortFrame,
    getVariables: getSelectionSortVariables,
    legend: SELECTION_SORT_LEGEND,
    counters: SWAP_COUNTERS,
  },
  [INSERTION_SORT_KEY]: {
    algorithm: insertionSort,
    getActiveLine: getInsertionSortActiveLine,
    getSourceActiveLine: getInsertionSortSourceActiveLine,
    getFrame: getInsertionSortFrame,
    getVariables: getInsertionSortVariables,
    legend: INSERTION_SORT_LEGEND,
    counters: SWAP_COUNTERS,
  },
  [QUICK_SORT_KEY]: {
    algorithm: quickSort,
    getActiveLine: getQuickSortActiveLine,
    getSourceActiveLine: getQuickSortSourceActiveLine,
    getFrame: getQuickSortFrame,
    getVariables: getQuickSortVariables,
    legend: QUICK_SORT_LEGEND,
    counters: SWAP_COUNTERS,
  },
  [MERGE_SORT_KEY]: {
    algorithm: mergeSort,
    getActiveLine: getMergeSortActiveLine,
    getSourceActiveLine: getMergeSortSourceActiveLine,
    getFrame: getMergeSortFrame,
    getVariables: getMergeSortVariables,
    legend: MERGE_SORT_LEGEND,
    counters: WRITE_COUNTERS,
  },
} satisfies Record<SortingAlgorithm["metadata"]["key"], ISortingVisualConfig>;

const CONFIGS_BY_KEY: Readonly<Record<string, ISortingVisualConfig>> =
  SORTING_VISUAL_CONFIGS;

export function findSortingVisualConfig(
  key: string,
): ISortingVisualConfig | undefined {
  return Object.hasOwn(CONFIGS_BY_KEY, key) ? CONFIGS_BY_KEY[key] : undefined;
}
