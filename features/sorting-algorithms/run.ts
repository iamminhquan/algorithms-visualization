import {
  countPayloadTypes,
  type PayloadTypeCounts,
} from "@/engine/visualization";
import type { SortingAlgorithm } from "./index";
import { type SortingEvent, trackElementIds } from "./visualization";

export interface ISortingRun {
  readonly values: readonly number[];
  readonly events: readonly SortingEvent[];
  readonly ids: readonly (readonly number[])[];
  readonly counts: readonly PayloadTypeCounts<"compare" | "swap">[];
}

export function createSortingRun(
  algorithm: SortingAlgorithm,
  values: readonly number[],
): ISortingRun {
  const { events } = algorithm.execute(values);
  return {
    values,
    events,
    ids: trackElementIds(values.length, events),
    counts: countPayloadTypes(events, ["compare", "swap"]),
  };
}
