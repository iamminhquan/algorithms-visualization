import { describe, expect, test } from "bun:test";
import { getStep, MAX_INPUT_LENGTH, runAlgorithm } from "./run";
import type { SortingAlgorithm } from "./types";

const fake: SortingAlgorithm = {
  slug: "gia-lap",
  name: "Giả lập",
  sort: (a) => {
    if (a.compare(0, 1) > 0) a.swap(0, 1);
    a.markSorted(0);
  },
};

describe("runAlgorithm", () => {
  test("returns history with slug, input copy and steps", () => {
    const history = runAlgorithm(fake, [2, 1]);
    expect(history.slug).toBe("gia-lap");
    expect(history.input).toEqual([2, 1]);
    expect(history.steps.map((s) => s.action)).toEqual([
      "init",
      "compare",
      "swap",
      "mark-sorted",
      "done",
    ]);
    expect(history.steps[history.steps.length - 1].array).toEqual([1, 2]);
  });

  test("does not mutate input", () => {
    const input = [2, 1];
    runAlgorithm(fake, input);
    expect(input).toEqual([2, 1]);
  });

  test("rejects non-finite input", () => {
    let calls = 0;
    const counting: SortingAlgorithm = {
      ...fake,
      sort: () => {
        calls++;
      },
    };
    expect(() => runAlgorithm(counting, [1, Number.NaN])).toThrow(TypeError);
    expect(() => runAlgorithm(counting, [Number.POSITIVE_INFINITY])).toThrow(
      TypeError,
    );
    expect(() => runAlgorithm(counting, [Number.NEGATIVE_INFINITY, 0])).toThrow(
      TypeError,
    );
    expect(calls).toBe(0);
  });

  test("rejects input longer than MAX_INPUT_LENGTH", () => {
    let calls = 0;
    const counting: SortingAlgorithm = {
      ...fake,
      sort: () => {
        calls++;
      },
    };
    const tooLong = Array.from({ length: MAX_INPUT_LENGTH + 1 }, (_, k) => k);
    expect(() => runAlgorithm(counting, tooLong)).toThrow(RangeError);
    expect(calls).toBe(0);
  });

  test("accepts input of exactly MAX_INPUT_LENGTH", () => {
    const input = Array.from({ length: MAX_INPUT_LENGTH }, (_, k) => k);
    const history = runAlgorithm({ ...fake, sort: () => {} }, input);
    expect(history.input).toHaveLength(MAX_INPUT_LENGTH);
  });

  test("rejects asynchronous sort", () => {
    const asynchronous: SortingAlgorithm = {
      ...fake,
      sort: (async () => {}) as SortingAlgorithm["sort"],
    };
    expect(() => runAlgorithm(asynchronous, [2, 1])).toThrow(TypeError);
  });

  test("history input is a copy of the caller's array", () => {
    const input = [2, 1];
    expect(runAlgorithm(fake, input).input).not.toBe(input);
  });

  test("propagates algorithm errors", () => {
    const broken: SortingAlgorithm = {
      ...fake,
      sort: () => {
        throw new Error("hỏng");
      },
    };
    expect(() => runAlgorithm(broken, [1])).toThrow("hỏng");
  });

  test("history is frozen", () => {
    const history = runAlgorithm(fake, [2, 1]);
    expect(Object.isFrozen(history)).toBe(true);
    expect(Object.isFrozen(history.steps)).toBe(true);
    expect(Object.isFrozen(history.input)).toBe(true);
    expect(Object.isFrozen(history.steps[1].array)).toBe(true);
  });

  test("history is JSON round-trippable", () => {
    const history = runAlgorithm(fake, [2, 1]);
    expect(JSON.parse(JSON.stringify(history))).toEqual(history);
  });

  test("empty input", () => {
    const history = runAlgorithm({ ...fake, sort: () => {} }, []);
    expect(history.steps.map((s) => s.action)).toEqual(["init", "done"]);
  });
});

describe("getStep", () => {
  test("returns step by index", () => {
    const history = runAlgorithm(fake, [2, 1]);
    expect(getStep(history, 2).action).toBe("swap");
  });

  test("rejects out of range", () => {
    const history = runAlgorithm(fake, [2, 1]);
    expect(() => getStep(history, -1)).toThrow(RangeError);
    expect(() => getStep(history, history.steps.length)).toThrow(RangeError);
    expect(() => getStep(history, 0.5)).toThrow(RangeError);
  });
});
