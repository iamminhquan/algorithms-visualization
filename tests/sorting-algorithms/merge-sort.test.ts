import { describe, expect, test } from "bun:test";
import {
  getMergeSortActiveLine,
  getMergeSortFrame,
  getMergeSortVariables,
  mergeSort,
} from "@/features/sorting-algorithms/merge-sort";
import { trackElementIds } from "@/features/sorting-algorithms/visualization";

const sortAscending = (values: readonly number[]) =>
  [...values].sort((a, b) => a - b);

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [5, 3, 8, 1],
  [38, 27, 43, 3, 9, 82, 10, 55, 19, 64],
  [3, 1, 3, 2, 1],
  [0, -5, 3, -1, -5],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

describe("mergeSort", () => {
  test("sắp xếp đúng và chỉ số đo khớp với số sự kiện", () => {
    for (const input of SAMPLE_INPUTS) {
      const { output, events, metrics } = mergeSort.execute(input);
      const countOf = (type: string) =>
        events.filter((event) => event.payload.type === type).length;

      expect(output).toEqual(sortAscending(input));
      expect(metrics.comparisons).toBe(countOf("compare"));
      expect(metrics.writes).toBe(countOf("write"));
    }
  });

  test("ổn định: các giá trị bằng nhau giữ thứ tự ban đầu", () => {
    const input = [2, 1, 2, 1];
    const { events } = mergeSort.execute(input);
    expect(trackElementIds(input.length, events).at(-1)).toEqual([1, 3, 0, 2]);
  });

  test("vết của [3, 1, 2]: trộn [3] với [1], rồi [1, 3] với [2]", () => {
    const { events, metrics } = mergeSort.execute([3, 1, 2]);
    const firstMerge = { lo: 0, mid: 0, hi: 1 };
    const secondMerge = { lo: 0, mid: 1, hi: 2 };

    expect(metrics).toEqual({ comparisons: 3, writes: 5 });
    expect(events.map((event) => event.payload)).toEqual([
      { type: "compare", indices: [0, 1], ...firstMerge, i: 0, j: 0 },
      {
        type: "write",
        from: 1,
        to: 0,
        side: "right",
        ...firstMerge,
        i: 0,
        j: 0,
      },
      {
        type: "write",
        from: 1,
        to: 1,
        side: "left",
        ...firstMerge,
        i: 0,
        j: 1,
      },
      { type: "compare", indices: [0, 2], ...secondMerge, i: 0, j: 0 },
      {
        type: "write",
        from: 0,
        to: 0,
        side: "left",
        ...secondMerge,
        i: 0,
        j: 0,
      },
      { type: "compare", indices: [1, 2], ...secondMerge, i: 1, j: 0 },
      {
        type: "write",
        from: 2,
        to: 1,
        side: "right",
        ...secondMerge,
        i: 1,
        j: 0,
      },
      {
        type: "write",
        from: 2,
        to: 2,
        side: "left",
        ...secondMerge,
        i: 1,
        j: 1,
      },
      { type: "mark-sorted", indices: [0, 1, 2] },
      { type: "complete" },
    ]);
    expect(events.map((event) => event.state.array)).toEqual([
      [3, 1, 2],
      [1, 3, 2],
      [1, 3, 2],
      [1, 3, 2],
      [1, 3, 2],
      [1, 3, 2],
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ]);
    expect(
      events.map((event) => getMergeSortActiveLine(event.payload)),
    ).toEqual([7, 10, 8, 7, 8, 7, 10, 8, 12, 13]);
  });

  test("chỉ chốt toàn bộ mảng sau lần trộn cuối", () => {
    const { events } = mergeSort.execute([4, 3, 2, 1]);
    const marks = events.filter(
      (event) => event.payload.type === "mark-sorted",
    );

    expect(marks).toHaveLength(1);
    expect(events.at(-3)?.state.sortedIndices).toEqual([]);
    expect(events.at(-2)?.state.sortedIndices).toEqual([0, 1, 2, 3]);
  });

  test("khung, huy hiệu và biến khi so sánh rồi ghi right[j] vào a[k]", () => {
    const { events } = mergeSort.execute([3, 1, 2]);
    const compare = getMergeSortFrame(events[5]);

    expect(compare.range).toEqual({ from: 0, to: 2 });
    expect(compare.markers).toEqual([
      [],
      [
        { label: "k", tone: "pointer" },
        { label: "i", tone: "compare" },
      ],
      [{ label: "j", tone: "compare" }],
    ]);
    expect(compare.bracket?.label).toBe("3 > 2");

    const toRecord = (index: number) =>
      Object.fromEntries(
        getMergeSortVariables(events[index]).map(({ name, value }) => [
          name,
          value,
        ]),
      );
    expect(toRecord(5)).toEqual({
      n: 3,
      lo: 0,
      mid: 1,
      hi: 2,
      k: 1,
      i: 1,
      j: 0,
      "left[i]": 3,
      "right[j]": 2,
    });
    expect(toRecord(6)).toEqual({
      n: 3,
      lo: 0,
      mid: 1,
      hi: 2,
      k: 1,
      i: 1,
      j: 0,
      "left[i]": 3,
      "right[j]": 2,
    });
    expect(getMergeSortFrame(events[6]).tones).toEqual([
      "default",
      "swap",
      "default",
    ]);
  });
});
