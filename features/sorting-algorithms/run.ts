import type { IMetricItem } from "@/components/visualization/visualizer-frame";
import {
  countPayloadTypes,
  getEventIndex,
  type PayloadTypeCounts,
  READY_STEP_DESCRIPTION,
} from "@/engine/visualization";
import type { SortingAlgorithm } from "./index";
import { type SortingEvent, trackElementIds } from "./visualization";

export type SortingCounter = "compare" | "swap" | "write";

const SORTING_COUNTERS: readonly SortingCounter[] = [
  "compare",
  "swap",
  "write",
];

const COUNTER_LABELS: Readonly<Record<SortingCounter, string>> = {
  compare: "So sánh",
  swap: "Hoán đổi",
  write: "Ghi mảng",
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

export function getRunEvent(
  run: ISortingRun,
  stepIndex: number,
): SortingEvent | undefined {
  return run.events[getEventIndex(stepIndex)];
}

export function getRunDescription(run: ISortingRun, stepIndex: number): string {
  return getRunEvent(run, stepIndex)?.description ?? READY_STEP_DESCRIPTION;
}

export function getRunMetrics(
  run: ISortingRun,
  stepIndex: number,
  counters: readonly SortingCounter[],
): readonly IMetricItem[] {
  const counts = run.counts[getEventIndex(stepIndex)];
  return counters.map((counter) => ({
    label: COUNTER_LABELS[counter],
    value: counts?.[counter] ?? 0,
  }));
}
