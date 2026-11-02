import { bubbleSort } from "./bubble-sort";
import { insertionSort } from "./insertion-sort";
import { quickSort } from "./quick-sort";
import { selectionSort } from "./selection-sort";

export const SORTING_ALGORITHMS = [
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
] as const;

export type SortingAlgorithm = (typeof SORTING_ALGORITHMS)[number];
