import { BUBBLE_SORT_KEY } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import { INSERTION_SORT_KEY } from "./insertion-sort";
import { QUICK_SORT_KEY } from "./quick-sort";
import { SELECTION_SORT_KEY } from "./selection-sort";

export interface ISortingComplexity {
  readonly bestTime: string;
  readonly averageTime: string;
  readonly worstTime: string;
  readonly space: string;
  readonly isStable: boolean;
}

const SORTING_COMPLEXITY = {
  [BUBBLE_SORT_KEY]: {
    bestTime: "O(n)",
    averageTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    isStable: true,
  },
  [SELECTION_SORT_KEY]: {
    bestTime: "O(n²)",
    averageTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    isStable: false,
  },
  [INSERTION_SORT_KEY]: {
    bestTime: "O(n)",
    averageTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    isStable: true,
  },
  [QUICK_SORT_KEY]: {
    bestTime: "O(n log n)",
    averageTime: "O(n log n)",
    worstTime: "O(n²)",
    space: "O(log n)",
    isStable: false,
  },
} satisfies Record<SortingAlgorithm["metadata"]["key"], ISortingComplexity>;

const COMPLEXITY_BY_KEY: ReadonlyMap<string, ISortingComplexity> = new Map(
  Object.entries(SORTING_COMPLEXITY),
);

export function findSortingComplexity(
  algorithmKey: string,
): ISortingComplexity | undefined {
  return COMPLEXITY_BY_KEY.get(algorithmKey);
}
