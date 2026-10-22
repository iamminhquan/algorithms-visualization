import { bubbleSort } from "./bubble-sort";
import { selectionSort } from "./selection-sort";

export const SORTING_ALGORITHMS = [bubbleSort, selectionSort] as const;
