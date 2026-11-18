import { describe, expect, test } from "bun:test";
import {
  getQuickSortActiveLine,
  getQuickSortFrame,
  getQuickSortSourceActiveLine,
  getQuickSortVariables,
  quickSort,
} from "@/features/sorting-algorithms/quick-sort";

const sortAscending = (values: readonly number[]) =>
  [...values].sort((a, b) => a - b);

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [5, 3, 8, 1],
  [38, 27, 43, 3, 9, 82, 10, 55, 19, 64],
  [3, 1, 3, 2, 1],
  [0, -5, 3, -1, -5],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

describe("quickSort", () => {
  test("sắp xếp đúng và chỉ số đo khớp với số sự kiện", () => {
    for (const input of SAMPLE_INPUTS) {
      const { output, events, metrics } = quickSort.execute(input);
      const countOf = (type: string) =>
        events.filter((event) => event.payload.type === type).length;

      expect(output).toEqual(sortAscending(input));
      expect(metrics.comparisons).toBe(countOf("compare"));
      expect(metrics.swaps).toBe(countOf("swap"));
      expect(metrics.writes).toBe(metrics.swaps * 2);
    }
  });

  test("sắp xếp đúng mọi mẫu đầu vào", () => {
    for (const input of SAMPLE_INPUTS) {
      const { output } = quickSort.execute(input);
      expect(output).toEqual(sortAscending(input));
    }
  });

  test("vết của [3, 1, 2] theo phân hoạch Hoare", () => {
    const { events } = quickSort.execute([3, 1, 2]);
    expect(events.map((event) => event.payload)).toEqual([
      {
        type: "compare",
        indices: [0],
        lo: 0,
        hi: 2,
        i: 0,
        j: 2,
        pivot: 1,
        mid: 1,
        side: "i",
      },
      {
        type: "compare",
        indices: [2],
        lo: 0,
        hi: 2,
        i: 0,
        j: 2,
        pivot: 1,
        mid: 1,
        side: "j",
      },
      {
        type: "compare",
        indices: [1],
        lo: 0,
        hi: 2,
        i: 0,
        j: 1,
        pivot: 1,
        mid: 1,
        side: "j",
      },
      {
        type: "compare",
        indices: [0, 1],
        lo: 0,
        hi: 2,
        i: 0,
        j: 1,
        pivot: 1,
        mid: 1,
        side: "ij",
      },
      {
        type: "swap",
        indices: [0, 1],
        lo: 0,
        hi: 2,
        i: 0,
        j: 1,
        pivot: 1,
        mid: 1,
      },
      {
        type: "compare",
        indices: [0, 0],
        lo: 0,
        hi: 2,
        i: 1,
        j: 0,
        pivot: 1,
        mid: 1,
        side: "left-j",
      },
      {
        type: "compare",
        indices: [1, 2],
        lo: 0,
        hi: 2,
        i: 1,
        j: 0,
        pivot: 1,
        mid: 1,
        side: "i-right",
      },
      {
        type: "recurse",
        side: "right",
        lo: 0,
        hi: 2,
        i: 1,
        j: 0,
        pivot: 1,
        mid: 1,
      },
      {
        type: "compare",
        indices: [1],
        lo: 1,
        hi: 2,
        i: 1,
        j: 2,
        pivot: 3,
        mid: 1,
        side: "i",
      },
      {
        type: "compare",
        indices: [2],
        lo: 1,
        hi: 2,
        i: 1,
        j: 2,
        pivot: 3,
        mid: 1,
        side: "j",
      },
      {
        type: "compare",
        indices: [1, 2],
        lo: 1,
        hi: 2,
        i: 1,
        j: 2,
        pivot: 3,
        mid: 1,
        side: "ij",
      },
      {
        type: "swap",
        indices: [1, 2],
        lo: 1,
        hi: 2,
        i: 1,
        j: 2,
        pivot: 3,
        mid: 1,
      },
      {
        type: "compare",
        indices: [1, 1],
        lo: 1,
        hi: 2,
        i: 2,
        j: 1,
        pivot: 3,
        mid: 1,
        side: "left-j",
      },
      {
        type: "compare",
        indices: [2, 2],
        lo: 1,
        hi: 2,
        i: 2,
        j: 1,
        pivot: 3,
        mid: 1,
        side: "i-right",
      },
      { type: "complete" },
    ]);
    expect(
      events.map((event) => getQuickSortActiveLine(event.payload)),
    ).toEqual([9, 11, 11, 13, 14, 18, 19, 19, 9, 11, 13, 14, 18, 19, 21]);
    expect(
      events.map((event) => getQuickSortSourceActiveLine(event.payload)),
    ).toEqual([8, 9, 9, 11, 12, 18, 22, 23, 8, 9, 11, 12, 18, 22, 25]);
  });

  test("khung, huy hiệu và biến khi so sánh với pivot", () => {
    const { events } = quickSort.execute([3, 1, 2]);
    const frame = getQuickSortFrame(events[0]);

    expect(frame.range).toEqual({ from: 0, to: 2 });
    expect(frame.tones).toEqual(["compare", "pivot", "default"]);
    expect(frame.markers).toEqual([
      [{ label: "i", tone: "pointer" }],
      [{ label: "pivot", tone: "pivot" }],
      [{ label: "j", tone: "pointer" }],
    ]);
    expect(frame.captions).toEqual([undefined, "pivot", undefined]);
    expect(frame.bracket?.label).toBe("3 > 1");
    expect(getQuickSortVariables(events[0])).toEqual([
      { name: "n", value: 3 },
      { name: "left", value: 0 },
      { name: "right", value: 2 },
      { name: "pivot", value: 1 },
      { name: "i", value: 0 },
      { name: "j", value: 2 },
      { name: "mid", value: 1 },
    ]);
  });
});
