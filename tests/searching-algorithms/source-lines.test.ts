import { describe, expect, test } from "bun:test";
import type { IEventPayload } from "@/engine/algorithm";
import {
  binarySearch,
  getBinarySearchSourceActiveLine,
} from "@/features/searching-algorithms/binary-search";
import {
  getLinearSearchSourceActiveLine,
  linearSearch,
} from "@/features/searching-algorithms/linear-search";
import { getSeedSourceLines } from "../helpers/seed-snippets";

const SORTED_ARRAYS: readonly (readonly number[])[] = [
  [],
  [7],
  [1, 3],
  [1, 3, 5, 8],
  [2, 2, 2],
];

const SEARCH_KEYS: readonly string[] = ["linear-search", "binary-search"];

describe("dòng mã nguồn C++ của thuật toán tìm kiếm", () => {
  test("mỗi bước tô một dòng có thật trong đoạn mã nguồn", () => {
    expectEveryStepHasSourceLine(
      (input, target) => linearSearch.execute({ array: input, target }).events,
      getLinearSearchSourceActiveLine,
      getSeedSourceLines("linear-search"),
    );
    expectEveryStepHasSourceLine(
      (input, target) => binarySearch.execute({ array: input, target }).events,
      getBinarySearchSourceActiveLine,
      getSeedSourceLines("binary-search"),
    );
  });

  test("đoạn mã nguồn không còn phần khởi động hay thư viện", () => {
    for (const key of SEARCH_KEYS) {
      for (const line of getSeedSourceLines(key)) {
        expect(line).not.toContain("#include");
        expect(line).not.toMatch(/\bmain\s*\(/);
      }
    }
  });

  test("Linear Search tô đúng dòng so sánh và tìm thấy", () => {
    const lines = getSeedSourceLines("linear-search");
    const events = linearSearch.execute({ array: [1, 2], target: 2 }).events;
    const compare = getEvent(events, "compare");
    const found = getEvent(events, "found");

    expect(lines[lineOf(getLinearSearchSourceActiveLine, compare)]).toContain(
      "a[i] == key",
    );
    expect(lines[lineOf(getLinearSearchSourceActiveLine, found)]).toContain(
      "return i;",
    );
  });

  test("Binary Search tô đúng dòng so sánh và thu hẹp khoảng", () => {
    const lines = getSeedSourceLines("binary-search");
    const events = binarySearch.execute({ array: [1, 2], target: 2 }).events;
    const compare = getEvent(events, "compare");
    const right = events.find(
      (event) =>
        event.payload.type === "narrow" && event.payload.keep === "right",
    );
    const left = events.find(
      (event) =>
        event.payload.type === "narrow" && event.payload.keep === "left",
    );

    expect(lines[lineOf(getBinarySearchSourceActiveLine, compare)]).toContain(
      "a[mid] == key",
    );
    if (right !== undefined) {
      expect(lines[lineOf(getBinarySearchSourceActiveLine, right)]).toContain(
        "low = mid + 1",
      );
    }
    if (left !== undefined) {
      expect(lines[lineOf(getBinarySearchSourceActiveLine, left)]).toContain(
        "high = mid - 1",
      );
    }
  });
});

function expectEveryStepHasSourceLine<TStep extends IEventPayload>(
  run: (
    input: readonly number[],
    target: number,
  ) => readonly {
    readonly payload: TStep;
  }[],
  getLine: (step: TStep) => number | undefined,
  lines: readonly string[],
) {
  for (const array of SORTED_ARRAYS) {
    for (const target of [...array, 0, 100]) {
      for (const { payload } of run(array, target)) {
        const line = getLine(payload);
        if (line === undefined) {
          throw new Error(`Bước "${payload.type}" không ứng với dòng nào`);
        }
        expect(line).toBeGreaterThanOrEqual(0);
        expect(line).toBeLessThan(lines.length);
      }
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
