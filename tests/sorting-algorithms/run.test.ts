import { describe, expect, test } from "bun:test";
import { SORTING_ALGORITHMS } from "@/features/sorting-algorithms";
import { createSortingRun } from "@/features/sorting-algorithms/run";

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [],
  [7],
  [5, 3, 8, 1],
  [5, 4, 3, 2, 1],
  [2, 2, 2],
];

describe("createSortingRun", () => {
  test("lần chạy khớp vết và số đếm của thuật toán trên mọi input mẫu", () => {
    for (const algorithm of SORTING_ALGORITHMS) {
      for (const values of SAMPLE_INPUTS) {
        const run = createSortingRun(algorithm, values);
        const { events, metrics } = algorithm.execute(values);

        expect(run.values).toBe(values);
        expect(run.events).toEqual(events);
        expect(run.ids).toHaveLength(events.length);
        expect(run.counts).toHaveLength(events.length);
        expect(run.counts.at(-1)).toEqual({
          compare: metrics.comparisons,
          swap: metrics.swaps,
        });
      }
    }
  });
});
