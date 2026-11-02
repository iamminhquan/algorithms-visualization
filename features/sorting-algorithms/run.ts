import type { IMetricItem } from "@/components/visualization/visualizer-frame";
import {
  countPayloadTypes,
  type PayloadTypeCounts,
} from "@/engine/visualization";
import type { SortingAlgorithm } from "./index";
import { type SortingEvent, trackElementIds } from "./visualization";

export type SortingCounter = "compare" | "swap";

const SORTING_COUNTERS: readonly SortingCounter[] = ["compare", "swap"];

const COUNTER_LABELS: Readonly<Record<SortingCounter, string>> = {
  compare: "So sánh",
  swap: "Hoán đổi",
};

export interface ISortingRun {
  readonly values: readonly number[];
  readonly events: readonly SortingEvent[];
  readonly ids: readonly (readonly number[])[];
  readonly counts: readonly PayloadTypeCounts<SortingCounter>[];
}

export function createSortingRun(
  algorithm: SortingAlgorithm,
  values: readonly number[],
): ISortingRun {
  const events: readonly SortingEvent[] = algorithm.execute(values).events;
  return {
    values,
    events,
    ids: trackElementIds(values.length, events),
    counts: countPayloadTypes(events, SORTING_COUNTERS),
  };
}

export function getRunMetrics(
  run: ISortingRun,
  index: number,
  counters: readonly SortingCounter[],
): readonly IMetricItem[] {
  const counts = run.counts[index];
  return counters.map((counter) => ({
    label: COUNTER_LABELS[counter],
    value: counts[counter],
  }));
}
