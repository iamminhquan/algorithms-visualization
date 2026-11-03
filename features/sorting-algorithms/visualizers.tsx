import { type ComponentType, lazy } from "react";
import { BUBBLE_SORT_KEY } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import { INSERTION_SORT_KEY } from "./insertion-sort";
import { MERGE_SORT_KEY } from "./merge-sort";
import { QUICK_SORT_KEY } from "./quick-sort";
import { SELECTION_SORT_KEY } from "./selection-sort";
import { SORTING_VISUAL_CONFIGS } from "./visual-configs";

const SortingVisualizer = lazy(() =>
  import("./components/sorting-visualizer").then((module) => ({
    default: module.SortingVisualizer,
  })),
);

function BubbleSortVisualizer() {
  return <SortingVisualizer {...SORTING_VISUAL_CONFIGS[BUBBLE_SORT_KEY]} />;
}

function SelectionSortVisualizer() {
  return <SortingVisualizer {...SORTING_VISUAL_CONFIGS[SELECTION_SORT_KEY]} />;
}

function InsertionSortVisualizer() {
  return <SortingVisualizer {...SORTING_VISUAL_CONFIGS[INSERTION_SORT_KEY]} />;
}

function QuickSortVisualizer() {
  return <SortingVisualizer {...SORTING_VISUAL_CONFIGS[QUICK_SORT_KEY]} />;
}

function MergeSortVisualizer() {
  return <SortingVisualizer {...SORTING_VISUAL_CONFIGS[MERGE_SORT_KEY]} />;
}

export const SORTING_VISUALIZERS = {
  [BUBBLE_SORT_KEY]: BubbleSortVisualizer,
  [SELECTION_SORT_KEY]: SelectionSortVisualizer,
  [INSERTION_SORT_KEY]: InsertionSortVisualizer,
  [QUICK_SORT_KEY]: QuickSortVisualizer,
  [MERGE_SORT_KEY]: MergeSortVisualizer,
} satisfies Record<SortingAlgorithm["metadata"]["key"], ComponentType>;
