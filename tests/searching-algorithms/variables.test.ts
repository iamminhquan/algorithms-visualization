import { describe, expect, test } from "bun:test";
import type { IVariable } from "@/engine/visualization";
import {
  binarySearch,
  getBinarySearchVariables,
} from "@/features/searching-algorithms/binary-search";
import {
  getLinearSearchVariables,
  linearSearch,
} from "@/features/searching-algorithms/linear-search";

function toRecord(
  variables: readonly IVariable[],
): Record<string, number | undefined> {
  return Object.fromEntries(
    variables.map((variable) => [variable.name, variable.value]),
  );
}

describe("getLinearSearchVariables", () => {
  test("i và a[i] theo vị trí đang xét, giữ nguyên khi tìm thấy", () => {
    const { events } = linearSearch.execute({ array: [5, 3, 8], target: 3 });
    expect(
      events.map((event) => toRecord(getLinearSearchVariables(event))),
    ).toEqual([
      { n: 3, key: 3, i: 0, "a[i]": 5 },
      { n: 3, key: 3, i: 1, "a[i]": 3 },
      { n: 3, key: 3, i: 1, "a[i]": 3 },
    ]);
  });

  test("không tìm thấy thì i đã hết phạm vi", () => {
    const { events } = linearSearch.execute({ array: [5], target: 1 });
    expect(toRecord(getLinearSearchVariables(events[1]))).toEqual({
      n: 1,
      key: 1,
      i: undefined,
      "a[i]": undefined,
    });
  });
});

describe("getBinarySearchVariables", () => {
  test("low, high, mid ở từng bước khi tìm thấy", () => {
    const { events } = binarySearch.execute({
      array: [1, 3, 5, 8],
      target: 8,
    });
    const records = events.map((event) =>
      toRecord(getBinarySearchVariables(event)),
    );

    expect(records[0]).toEqual({
      n: 4,
      key: 8,
      low: 0,
      high: 3,
      mid: undefined,
      "a[mid]": undefined,
    });
    expect(records[3]).toEqual({
      n: 4,
      key: 8,
      low: 2,
      high: 3,
      mid: 1,
      "a[mid]": 3,
    });
    expect(records[records.length - 1]).toEqual({
      n: 4,
      key: 8,
      low: 3,
      high: 3,
      mid: 3,
      "a[mid]": 8,
    });
  });

  test("không tìm thấy thì mid đã hết phạm vi", () => {
    const { events } = binarySearch.execute({ array: [1, 3], target: 0 });
    expect(
      toRecord(getBinarySearchVariables(events[events.length - 1])),
    ).toEqual({
      n: 2,
      key: 0,
      low: 0,
      high: -1,
      mid: undefined,
      "a[mid]": undefined,
    });
  });
});
