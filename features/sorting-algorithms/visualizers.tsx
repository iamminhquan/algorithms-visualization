import { type ComponentType, lazy } from "react";
import type { IAlgorithmCodeContent } from "@/features/catalog/code-content";
import { BUBBLE_SORT_KEY } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import { INSERTION_SORT_KEY } from "./insertion-sort";
import { MERGE_SORT_KEY } from "./merge-sort";
import { QUICK_SORT_KEY } from "./quick-sort";
import { SELECTION_SORT_KEY } from "./selection-sort";
import {
  type ISortingVisualConfig,
  SORTING_VISUAL_CONFIGS,
} from "./visual-configs";

const SortingVisualizer = lazy(() =>
  import("./components/sorting-visualizer").then((module) => ({
    default: module.SortingVisualizer,
  })),
);

function createVisualizer(config: ISortingVisualConfig) {
  return function SortingAlgorithmVisualizer({
    pseudocode,
    sourceCode,
  }: IAlgorithmCodeContent) {
    return (
      <SortingVisualizer
        {...config}
        pseudocode={{
          lines: pseudocode,
          getActiveLine: config.getActiveLine,
        }}
        sourceCode={sourceCode}
      />
    );
  };
}

export const SORTING_VISUALIZERS = {
  [BUBBLE_SORT_KEY]: createVisualizer(SORTING_VISUAL_CONFIGS[BUBBLE_SORT_KEY]),
  [SELECTION_SORT_KEY]: createVisualizer(
    SORTING_VISUAL_CONFIGS[SELECTION_SORT_KEY],
  ),
  [INSERTION_SORT_KEY]: createVisualizer(
    SORTING_VISUAL_CONFIGS[INSERTION_SORT_KEY],
  ),
  [QUICK_SORT_KEY]: createVisualizer(SORTING_VISUAL_CONFIGS[QUICK_SORT_KEY]),
  [MERGE_SORT_KEY]: createVisualizer(SORTING_VISUAL_CONFIGS[MERGE_SORT_KEY]),
} satisfies Record<
  SortingAlgorithm["metadata"]["key"],
  ComponentType<IAlgorithmCodeContent>
>;
