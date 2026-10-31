import type { ILegendItem } from "@/components/visualization/visualizer-frame";
import type {
  IPseudocode,
  IVariable,
  SourceCode,
} from "@/engine/visualization";
import {
  BUBBLE_SORT_KEY,
  BUBBLE_SORT_LEGEND,
  BUBBLE_SORT_PSEUDOCODE,
  BUBBLE_SORT_SOURCE_CODE,
  bubbleSort,
  getBubbleSortFrame,
  getBubbleSortVariables,
} from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import {
  getSelectionSortFrame,
  getSelectionSortVariables,
  SELECTION_SORT_KEY,
  SELECTION_SORT_LEGEND,
  SELECTION_SORT_PSEUDOCODE,
  SELECTION_SORT_SOURCE_CODE,
  selectionSort,
} from "./selection-sort";
import type { ISortingFrame, SortingEvent } from "./visualization";

export interface ISortingVisualConfig {
  readonly algorithm: SortingAlgorithm;
  readonly pseudocode: IPseudocode<SortingEvent["payload"]>;
  readonly sourceCode: SourceCode;
  readonly getFrame: (event: SortingEvent) => ISortingFrame;
  readonly getVariables: (event: SortingEvent) => readonly IVariable[];
  readonly legend: readonly ILegendItem[];
}

export const SORTING_VISUAL_CONFIGS = {
  [BUBBLE_SORT_KEY]: {
    algorithm: bubbleSort,
    pseudocode: BUBBLE_SORT_PSEUDOCODE,
    sourceCode: BUBBLE_SORT_SOURCE_CODE,
    getFrame: getBubbleSortFrame,
    getVariables: getBubbleSortVariables,
    legend: BUBBLE_SORT_LEGEND,
  },
  [SELECTION_SORT_KEY]: {
    algorithm: selectionSort,
    pseudocode: SELECTION_SORT_PSEUDOCODE,
    sourceCode: SELECTION_SORT_SOURCE_CODE,
    getFrame: getSelectionSortFrame,
    getVariables: getSelectionSortVariables,
    legend: SELECTION_SORT_LEGEND,
  },
} satisfies Record<SortingAlgorithm["metadata"]["key"], ISortingVisualConfig>;

const CONFIGS_BY_KEY: Readonly<Record<string, ISortingVisualConfig>> =
  SORTING_VISUAL_CONFIGS;

export function findSortingVisualConfig(
  key: string,
): ISortingVisualConfig | undefined {
  return Object.hasOwn(CONFIGS_BY_KEY, key) ? CONFIGS_BY_KEY[key] : undefined;
}
