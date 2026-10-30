import { describe, expect, test } from "bun:test";
import type { IVariable } from "@/engine/visualization";
import {
  bubbleSort,
  getBubbleSortVariables,
} from "@/features/sorting-algorithms/bubble-sort";
import {
  getSelectionSortVariables,
  selectionSort,
} from "@/features/sorting-algorithms/selection-sort";

function toRecord(
  variables: readonly IVariable[],
): Record<string, number | undefined> {
  return Object.fromEntries(
    variables.map((variable) => [variable.name, variable.value]),
  );
}

describe("getBubbleSortVariables", () => {
  test("tên biến theo đúng thứ tự trong mã giả", () => {
    const { events } = bubbleSort.execute([6, 4, 7]);
    expect(getBubbleSortVariables(events[0]).map(({ name }) => name)).toEqual([
      "n",
      "end",
      "i",
      "a[i]",
      "a[i + 1]",
    ]);
  });

  test("giá trị biến ở từng bước của [6, 4, 7]", () => {
    const { events } = bubbleSort.execute([6, 4, 7]);
    const records = events.map((event) =>
      toRecord(getBubbleSortVariables(event)),
    );

    expect(records).toEqual([
      { n: 3, end: 2, i: 0, "a[i]": 6, "a[i + 1]": 4 },
      { n: 3, end: 2, i: 0, "a[i]": 4, "a[i + 1]": 6 },
      { n: 3, end: 2, i: 1, "a[i]": 6, "a[i + 1]": 7 },
      { n: 3, end: 2, i: undefined, "a[i]": undefined, "a[i + 1]": undefined },
      { n: 3, end: 1, i: 0, "a[i]": 4, "a[i + 1]": 6 },
      { n: 3, end: 1, i: undefined, "a[i]": undefined, "a[i + 1]": undefined },
      {
        n: 3,
        end: undefined,
        i: undefined,
        "a[i]": undefined,
        "a[i + 1]": undefined,
      },
    ]);
  });

  test("lượt cuối chốt a[0] với end = 0", () => {
    const { events } = bubbleSort.execute([2, 1]);
    const lastMark = events[events.length - 2];
    expect(lastMark.payload).toEqual({ type: "mark-sorted", indices: [0] });
    expect(toRecord(getBubbleSortVariables(lastMark)).end).toBe(0);
  });
});

describe("getSelectionSortVariables", () => {
  test("giá trị biến ở từng bước của [3, 1, 2]", () => {
    const { events } = selectionSort.execute([3, 1, 2]);
    const records = events.map((event) =>
      toRecord(getSelectionSortVariables(event)),
    );
    const outOfLoop = { j: undefined, "a[j]": undefined };

    expect(records).toEqual([
      { n: 3, i: 0, min: 0, j: 1, "a[j]": 1, "a[min]": 3 },
      { n: 3, i: 0, min: 1, j: 2, "a[j]": 2, "a[min]": 1 },
      { n: 3, i: 0, min: 1, ...outOfLoop, "a[min]": 3 },
      { n: 3, i: 0, min: undefined, ...outOfLoop, "a[min]": undefined },
      { n: 3, i: 1, min: 1, j: 2, "a[j]": 2, "a[min]": 3 },
      { n: 3, i: 1, min: 2, ...outOfLoop, "a[min]": 3 },
      { n: 3, i: 1, min: undefined, ...outOfLoop, "a[min]": undefined },
      { n: 3, i: 2, min: undefined, ...outOfLoop, "a[min]": undefined },
      { n: 3, i: undefined, min: undefined, ...outOfLoop, "a[min]": undefined },
    ]);
  });
});
