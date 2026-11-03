import { describe, expect, test } from "bun:test";
import {
  getQuickSortFrame,
  getQuickSortVariables,
  QUICK_SORT_PSEUDOCODE,
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

  test("mỗi pivot được chốt đúng vị trí cuối cùng của nó", () => {
    for (const input of SAMPLE_INPUTS) {
      const { output, events } = quickSort.execute(input);
      for (const { payload, state } of events) {
        if (payload.type === "mark-sorted") {
          const [p] = payload.indices;
          expect(state.array[p]).toBe(output[p]);
        }
      }
    }
  });

  test("vết của [3, 1, 2] theo phân hoạch Lomuto với pivot là phần tử cuối", () => {
    const { events } = quickSort.execute([3, 1, 2]);
    expect(events.map((event) => event.payload)).toEqual([
      { type: "compare", indices: [0, 2], lo: 0, hi: 2, i: -1 },
      { type: "compare", indices: [1, 2], lo: 0, hi: 2, i: -1 },
      { type: "swap", indices: [0, 1], lo: 0, hi: 2, i: 0 },
      { type: "swap", indices: [1, 2], lo: 0, hi: 2, i: 0 },
      { type: "mark-sorted", indices: [1] },
      { type: "mark-sorted", indices: [0] },
      { type: "mark-sorted", indices: [2] },
      { type: "complete" },
    ]);
    expect(
      events.map((event) => QUICK_SORT_PSEUDOCODE.getActiveLine(event.payload)),
    ).toEqual([4, 4, 5, 6, 7, 7, 7, 11]);
  });

  test("khung, huy hiệu và biến khi so sánh với pivot", () => {
    const { events } = quickSort.execute([3, 1, 2]);
    const frame = getQuickSortFrame(events[0]);

    expect(frame.range).toEqual({ from: 0, to: 2 });
    expect(frame.tones).toEqual(["compare", "default", "pivot"]);
    expect(frame.markers).toEqual([
      [{ label: "j", tone: "compare" }],
      [],
      [{ label: "pivot", tone: "pivot" }],
    ]);
    expect(frame.bracket?.label).toBe("3 > 2");
    expect(getQuickSortVariables(events[0])).toEqual([
      { name: "n", value: 3 },
      { name: "lo", value: 0 },
      { name: "hi", value: 2 },
      { name: "pivot", value: 2 },
      { name: "i", value: -1 },
      { name: "j", value: 0 },
      { name: "p", value: undefined },
    ]);
  });
});
