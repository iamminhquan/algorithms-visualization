import { describe, expect, test } from "bun:test";
import { READY_STEP_DESCRIPTION } from "@/engine/visualization";
import { SORTING_ALGORITHMS } from "@/features/sorting-algorithms";
import { bubbleSort } from "@/features/sorting-algorithms/bubble-sort";
import {
  createSortingRun,
  getRunDescription,
  getRunMetrics,
} from "@/features/sorting-algorithms/run";

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
        expect(run.counts.at(-1)).toEqual(
          "swaps" in metrics
            ? { compare: metrics.comparisons, swap: metrics.swaps, write: 0 }
            : { compare: metrics.comparisons, swap: 0, write: metrics.writes },
        );
      }
    }
  });
});

describe("bước sẵn sàng của một lần chạy", () => {
  test("bộ đếm bằng 0 trước khi chạy và bắt đầu đếm từ sự kiện đầu tiên", () => {
    const run = createSortingRun(bubbleSort, [5, 3, 8, 1]);

    expect(getRunMetrics(run, 0, ["compare", "swap"])).toEqual([
      { label: "So sánh", value: 0 },
      { label: "Hoán đổi", value: 0 },
    ]);
    expect(getRunMetrics(run, 1, ["compare", "swap"])).toEqual([
      { label: "So sánh", value: 1 },
      { label: "Hoán đổi", value: 0 },
    ]);
  });

  test("lời mô tả sẵn sàng thay cho sự kiện đầu tiên", () => {
    const run = createSortingRun(bubbleSort, [5, 3, 8, 1]);

    expect(getRunDescription(run, 0)).toBe(READY_STEP_DESCRIPTION);
    expect(getRunDescription(run, 1)).toBe(run.events[0].description);
  });
});
