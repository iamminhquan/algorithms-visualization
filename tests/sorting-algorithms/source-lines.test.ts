import { describe, expect, test } from "bun:test";
import type { IEventPayload } from "@/engine/algorithm";
import {
  bubbleSort,
  getBubbleSortSourceActiveLine,
} from "@/features/sorting-algorithms/bubble-sort";
import {
  getInsertionSortSourceActiveLine,
  insertionSort,
} from "@/features/sorting-algorithms/insertion-sort";
import {
  getMergeSortSourceActiveLine,
  mergeSort,
} from "@/features/sorting-algorithms/merge-sort";
import {
  getQuickSortSourceActiveLine,
  quickSort,
} from "@/features/sorting-algorithms/quick-sort";
import {
  getSelectionSortSourceActiveLine,
  selectionSort,
} from "@/features/sorting-algorithms/selection-sort";
import { getSeedSourceLines } from "../helpers/seed-snippets";

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [],
  [7],
  [2, 1],
  [5, 3, 8, 1],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [3, 1, 3, 2, 1],
];

const SORT_KEYS: readonly string[] = [
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
];

describe("dòng mã nguồn C++ của thuật toán sắp xếp", () => {
  test("mỗi bước tô một dòng có thật trong đoạn mã nguồn", () => {
    expectEveryStepHasSourceLine(
      (input) => bubbleSort.execute(input).events,
      getBubbleSortSourceActiveLine,
      getSeedSourceLines("bubble-sort"),
    );
    expectEveryStepHasSourceLine(
      (input) => selectionSort.execute(input).events,
      getSelectionSortSourceActiveLine,
      getSeedSourceLines("selection-sort"),
    );
    expectEveryStepHasSourceLine(
      (input) => insertionSort.execute(input).events,
      getInsertionSortSourceActiveLine,
      getSeedSourceLines("insertion-sort"),
    );
    expectEveryStepHasSourceLine(
      (input) => mergeSort.execute(input).events,
      getMergeSortSourceActiveLine,
      getSeedSourceLines("merge-sort"),
    );
    expectEveryStepHasSourceLine(
      (input) => quickSort.execute(input).events,
      getQuickSortSourceActiveLine,
      getSeedSourceLines("quick-sort"),
    );
  });

  test("đoạn mã nguồn không còn phần khởi động hay thư viện", () => {
    for (const key of SORT_KEYS) {
      for (const line of getSeedSourceLines(key)) {
        expect(line).not.toContain("#include");
        expect(line).not.toMatch(/\bmain\s*\(/);
      }
    }
  });

  test("Bubble Sort tô đúng dòng so sánh và hoán đổi", () => {
    const lines = getSeedSourceLines("bubble-sort");
    const events = bubbleSort.execute([2, 1]).events;
    const compare = getEvent(events, "compare");
    const swap = getEvent(events, "swap");

    expect(lines[lineOf(getBubbleSortSourceActiveLine, compare)]).toContain(
      "a[i] > a[i + 1]",
    );
    expect(lines[lineOf(getBubbleSortSourceActiveLine, swap)]).toContain(
      "std::swap",
    );
  });

  test("Selection Sort tô đúng dòng so sánh và hoán đổi", () => {
    const lines = getSeedSourceLines("selection-sort");
    const events = selectionSort.execute([2, 1]).events;
    const compare = getEvent(events, "compare");
    const swap = getEvent(events, "swap");

    expect(lines[lineOf(getSelectionSortSourceActiveLine, compare)]).toContain(
      "a[j] < a[min]",
    );
    expect(lines[lineOf(getSelectionSortSourceActiveLine, swap)]).toContain(
      "std::swap",
    );
  });

  test("Insertion Sort tô đúng dòng so sánh và hoán đổi", () => {
    const lines = getSeedSourceLines("insertion-sort");
    const events = insertionSort.execute([2, 1]).events;
    const compare = getEvent(events, "compare");
    const swap = getEvent(events, "swap");

    expect(lines[lineOf(getInsertionSortSourceActiveLine, compare)]).toContain(
      "a[j - 1] <= a[j]",
    );
    expect(lines[lineOf(getInsertionSortSourceActiveLine, swap)]).toContain(
      "std::swap",
    );
  });

  test("Merge Sort tô đúng dòng so sánh và ghi", () => {
    const lines = getSeedSourceLines("merge-sort");
    const events = mergeSort.execute([2, 1]).events;
    const compare = getEvent(events, "compare");
    const leftWrite = events.find(
      (event) =>
        event.payload.type === "write" && event.payload.side === "left",
    );
    const rightWrite = events.find(
      (event) =>
        event.payload.type === "write" && event.payload.side === "right",
    );

    expect(lines[lineOf(getMergeSortSourceActiveLine, compare)]).toContain(
      "left[i] <= right[j]",
    );
    if (leftWrite !== undefined) {
      expect(lines[lineOf(getMergeSortSourceActiveLine, leftWrite)]).toContain(
        "a[k] = left[i++]",
      );
    }
    if (rightWrite !== undefined) {
      expect(lines[lineOf(getMergeSortSourceActiveLine, rightWrite)]).toContain(
        "a[k] = right[j++]",
      );
    }
  });
});

function expectEveryStepHasSourceLine<TStep extends IEventPayload>(
  run: (input: readonly number[]) => readonly {
    readonly payload: TStep;
  }[],
  getLine: (step: TStep) => number | undefined,
  lines: readonly string[],
) {
  for (const input of SAMPLE_INPUTS) {
    for (const { payload } of run(input)) {
      const line = getLine(payload);
      if (line === undefined) {
        throw new Error(`Bước "${payload.type}" không ứng với dòng nào`);
      }
      expect(line).toBeGreaterThanOrEqual(0);
      expect(line).toBeLessThan(lines.length);
    }
  }
}

function getEvent<TStep extends IEventPayload>(
  events: readonly { readonly payload: TStep }[],
  type: TStep["type"],
): { readonly payload: TStep } {
  const event = events.find((item) => item.payload.type === type);
  if (event === undefined) {
    throw new Error(`Không tìm thấy bước "${type}"`);
  }
  return event;
}

function lineOf<TStep extends IEventPayload>(
  getLine: (step: TStep) => number | undefined,
  event: { readonly payload: TStep },
): number {
  const line = getLine(event.payload);
  if (line === undefined) {
    throw new Error(`Bước "${event.payload.type}" thiếu dòng mã nguồn`);
  }
  return line;
}
