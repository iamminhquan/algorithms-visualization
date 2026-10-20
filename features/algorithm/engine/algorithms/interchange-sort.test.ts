import { describe, expect, test } from "bun:test";
import { runAlgorithm } from "../run";
import { interchangeSort } from "./interchange-sort";

const run = (input: readonly number[]) => runAlgorithm(interchangeSort, input);

describe("interchangeSort", () => {
  test("exact step sequence for [3, 1, 2]", () => {
    const { steps } = run([3, 1, 2]);
    expect(steps.map((s) => s.action)).toEqual([
      "init",
      "compare",
      "swap",
      "compare",
      "mark-sorted",
      "compare",
      "swap",
      "mark-sorted",
      "done",
    ]);
    expect(steps.map((s) => s.indices)).toEqual([
      [],
      [0, 1],
      [0, 1],
      [0, 2],
      [0],
      [1, 2],
      [1, 2],
      [1],
      [],
    ]);
    const last = steps.at(-1);
    expect(last?.array).toEqual([1, 2, 3]);
    expect(last?.comparisons).toBe(3);
    expect(last?.swaps).toBe(2);
  });

  test.each([
    [[5, 3, 8, 1, 2], [1, 2, 3, 5, 8], 10, 7, 23],
    [[5, 4, 3, 2, 1], [1, 2, 3, 4, 5], 10, 10, 26],
    [[1, 2, 3, 4], [1, 2, 3, 4], 6, 0, 11],
    [[2, 2, 1], [1, 2, 2], 3, 1, 8],
    [[-1.5, 3, 0, -2], [-2, -1.5, 0, 3], 6, 4, 15],
    [[7], [7], 0, 0, 2],
    [[], [], 0, 0, 2],
  ])("%j -> %j (comparisons %d, swaps %d, steps %d)", (input, sorted, comparisons, swaps, stepCount) => {
    const { steps } = run(input);
    const last = steps.at(-1);
    expect(last?.array).toEqual(sorted);
    expect(last?.comparisons).toBe(comparisons);
    expect(last?.swaps).toBe(swaps);
    expect(steps.length).toBe(stepCount);
  });

  test("comparisons always n(n-1)/2", () => {
    for (let n = 0; n <= 8; n++) {
      const input = Array.from({ length: n }, (_, k) => (k * 7) % 5);
      expect(run(input).steps.at(-1)?.comparisons).toBe((n * (n - 1)) / 2 + 0); // + 0 normalises -0 for n = 0
    }
  });

  test("counters never decrease and only the matching one increments", () => {
    const { steps } = run([5, 3, 8, 1, 2]);
    for (let t = 1; t < steps.length; t++) {
      const prev = steps[t - 1];
      const cur = steps[t];
      expect(cur.comparisons).toBe(
        prev.comparisons + (cur.action === "compare" ? 1 : 0),
      );
      expect(cur.swaps).toBe(prev.swaps + (cur.action === "swap" ? 1 : 0));
    }
  });

  test("sorted stays sorted", () => {
    const { steps } = run([5, 3, 8, 1, 2]);
    for (let t = 0; t < steps.length - 1; t++) {
      for (let k = 0; k < steps[t].states.length; k++) {
        if (steps[t].states[k] !== "sorted") continue;
        for (let u = t + 1; u < steps.length; u++) {
          expect(
            steps[u].states[k] === "sorted" || steps[u].indices.includes(k),
          ).toBe(true);
        }
      }
    }
  });

  test("sorted prefix is final", () => {
    const input = [5, 3, 8, 1, 2];
    const expected = [...input].sort((a, b) => a - b);
    for (const step of run(input).steps) {
      if (step.action === "mark-sorted") {
        const i = step.indices[0];
        expect(step.array[i]).toBe(expected[i]);
      }
    }
  });

  test("large reversed input", () => {
    const { steps } = run(Array.from({ length: 100 }, (_, k) => 100 - k));
    const last = steps.at(-1);
    expect(last?.comparisons).toBe(4950);
    expect(last?.swaps).toBe(4950);
    expect(steps.length).toBe(10001);
    expect(last?.array).toEqual(Array.from({ length: 100 }, (_, k) => k + 1));
  });
});
