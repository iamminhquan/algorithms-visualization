import type { AlgorithmKey } from "../catalog";
import { BINARY_SEARCH_QUIZ } from "./banks/binary-search";
import { BUBBLE_SORT_QUIZ } from "./banks/bubble-sort";
import { INSERTION_SORT_QUIZ } from "./banks/insertion-sort";
import { LINEAR_SEARCH_QUIZ } from "./banks/linear-search";
import { MERGE_SORT_QUIZ } from "./banks/merge-sort";
import { QUICK_SORT_QUIZ } from "./banks/quick-sort";
import { SELECTION_SORT_QUIZ } from "./banks/selection-sort";
import type { IQuizQuestion } from "./types";

export const QUIZ_BANKS = {
  "bubble-sort": BUBBLE_SORT_QUIZ,
  "selection-sort": SELECTION_SORT_QUIZ,
  "insertion-sort": INSERTION_SORT_QUIZ,
  "merge-sort": MERGE_SORT_QUIZ,
  "quick-sort": QUICK_SORT_QUIZ,
  "linear-search": LINEAR_SEARCH_QUIZ,
  "binary-search": BINARY_SEARCH_QUIZ,
} satisfies Record<AlgorithmKey, readonly IQuizQuestion[]>;

function isAlgorithmKey(value: string): value is AlgorithmKey {
  return Object.hasOwn(QUIZ_BANKS, value);
}

export function getQuizBank(
  algorithmKey: string,
): readonly IQuizQuestion[] | undefined {
  return isAlgorithmKey(algorithmKey) ? QUIZ_BANKS[algorithmKey] : undefined;
}
