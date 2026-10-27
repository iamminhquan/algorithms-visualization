import { type ComponentType, lazy } from "react";
import {
  BUBBLE_SORT_KEY,
  BUBBLE_SORT_LEGEND,
  BUBBLE_SORT_PSEUDOCODE,
  bubbleSort,
  getBubbleSortFrame,
} from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import {
  getSelectionSortFrame,
  SELECTION_SORT_KEY,
  SELECTION_SORT_LEGEND,
  SELECTION_SORT_PSEUDOCODE,
  selectionSort,
} from "./selection-sort";

const SortingVisualizer = lazy(() =>
  import("./components/sorting-visualizer").then((module) => ({
    default: module.SortingVisualizer,
  })),
);

function BubbleSortVisualizer() {
  return (
    <SortingVisualizer
      algorithm={bubbleSort}
      pseudocode={BUBBLE_SORT_PSEUDOCODE}
      getFrame={getBubbleSortFrame}
      legend={BUBBLE_SORT_LEGEND}
    />
  );
}

function SelectionSortVisualizer() {
  return (
    <SortingVisualizer
      algorithm={selectionSort}
      pseudocode={SELECTION_SORT_PSEUDOCODE}
      getFrame={getSelectionSortFrame}
      legend={SELECTION_SORT_LEGEND}
    />
  );
}

/**
 * Trình mô phỏng của từng thuật toán sắp xếp, tra theo `metadata.key`. Phải render bên trong
 * `<Suspense>` vì component được tải lười.
 */
export const SORTING_VISUALIZERS = {
  [BUBBLE_SORT_KEY]: BubbleSortVisualizer,
  [SELECTION_SORT_KEY]: SelectionSortVisualizer,
} satisfies Record<SortingAlgorithm["metadata"]["key"], ComponentType>;
