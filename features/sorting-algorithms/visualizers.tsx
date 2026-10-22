import { type ComponentType, lazy } from "react";
import { BUBBLE_SORT_KEY, bubbleSort } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import { SELECTION_SORT_KEY, selectionSort } from "./selection-sort";

/*
 * Tải lười để trang của danh mục khác không phải tải code mô phỏng sắp xếp.
 */
const SortingVisualizer = lazy(() =>
  import("./components/sorting-visualizer").then((module) => ({
    default: module.SortingVisualizer,
  })),
);

function BubbleSortVisualizer() {
  return <SortingVisualizer algorithm={bubbleSort} />;
}

function SelectionSortVisualizer() {
  return <SortingVisualizer algorithm={selectionSort} />;
}

/**
 * Trình mô phỏng của từng thuật toán sắp xếp, tra theo `metadata.key`. Phải render bên trong
 * `<Suspense>` vì component được tải lười.
 */
export const SORTING_VISUALIZERS = {
  [BUBBLE_SORT_KEY]: BubbleSortVisualizer,
  [SELECTION_SORT_KEY]: SelectionSortVisualizer,
} satisfies Record<SortingAlgorithm["metadata"]["key"], ComponentType>;
