import { type ComponentType, lazy } from "react";
import { BUBBLE_SORT_KEY } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
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

export const SORTING_VISUALIZERS = {
  [BUBBLE_SORT_KEY]: BubbleSortVisualizer,
  [SELECTION_SORT_KEY]: SelectionSortVisualizer,
} satisfies Record<SortingAlgorithm["metadata"]["key"], ComponentType>;
