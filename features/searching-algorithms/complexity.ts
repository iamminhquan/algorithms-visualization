import { BINARY_SEARCH_KEY } from "./binary-search";
import type { SearchingAlgorithm } from "./index";
import { LINEAR_SEARCH_KEY } from "./linear-search";

export interface ISearchingComplexity {
  readonly bestTime: string;
  readonly averageTime: string;
  readonly worstTime: string;
  readonly space: string;
  readonly requiresSorted: boolean;
}

const SEARCHING_COMPLEXITY = {
  [LINEAR_SEARCH_KEY]: {
    bestTime: "O(1)",
    averageTime: "O(n)",
    worstTime: "O(n)",
    space: "O(1)",
    requiresSorted: false,
  },
  [BINARY_SEARCH_KEY]: {
    bestTime: "O(1)",
    averageTime: "O(log n)",
    worstTime: "O(log n)",
    space: "O(1)",
    requiresSorted: true,
  },
} satisfies Record<SearchingAlgorithm["metadata"]["key"], ISearchingComplexity>;

const COMPLEXITY_BY_KEY: ReadonlyMap<string, ISearchingComplexity> = new Map(
  Object.entries(SEARCHING_COMPLEXITY),
);

export function findSearchingComplexity(
  algorithmKey: string,
): ISearchingComplexity | undefined {
  return COMPLEXITY_BY_KEY.get(algorithmKey);
}
