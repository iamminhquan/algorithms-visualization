import { describe, expect, test } from "bun:test";
import { bubbleSort } from "@/features/sorting-algorithms/bubble-sort";
import { getBubbleSortFrame } from "@/features/sorting-algorithms/bubble-sort/visualization";
import { selectionSort } from "@/features/sorting-algorithms/selection-sort";
import { getSelectionSortFrame } from "@/features/sorting-algorithms/selection-sort/visualization";

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [],
  [7],
  [5, 3, 8, 1],
  [5, 4, 3, 2, 1],
  [3, 1, 3, 2, 1],
  [2, 2, 2],
];

describe("getBubbleSortFrame", () => {
  test("ngoặc ghi kết quả so sánh rồi ghi hoán đổi", () => {
    const { events } = bubbleSort.execute([6, 4, 7]);
    const frames = events.map(getBubbleSortFrame);

    expect(frames[0].bracket).toEqual({
      from: 0,
      to: 1,
      label: "6 > 4",
      tone: "compare",
    });
    expect(frames[1].bracket).toEqual({
      from: 0,
      to: 1,
      label: "Hoán đổi",
      tone: "swap",
    });
    expect(frames[2].bracket?.label).toBe("6 ≤ 7");
  });

  test("giá trị bằng nhau không phải thứ tự sai", () => {
    const { events } = bubbleSort.execute([2, 2]);
    expect(getBubbleSortFrame(events[0]).bracket?.label).toBe("2 ≤ 2");
  });

  test("bước đánh dấu và hoàn tất không có ngoặc", () => {
    const { events } = bubbleSort.execute([2, 1]);
    for (const event of events.slice(-2)) {
      expect(getBubbleSortFrame(event).bracket).toBeUndefined();
    }
  });

  test("mọi bước có tone và huy hiệu cho từng vị trí", () => {
    for (const input of SAMPLE_INPUTS) {
      for (const event of bubbleSort.execute(input).events) {
        const frame = getBubbleSortFrame(event);
        expect(frame.tones).toHaveLength(input.length);
        expect(frame.markers).toHaveLength(input.length);
      }
    }
  });
});

describe("getSelectionSortFrame", () => {
  test("so sánh: huy hiệu i, min, j nằm đúng cột và min tô màu pivot", () => {
    const { events } = selectionSort.execute([5, 3, 8, 1]);

    const first = getSelectionSortFrame(events[0]);
    expect(first.markers).toEqual([
      [
        { label: "i", tone: "pointer" },
        { label: "min", tone: "pivot" },
      ],
      [{ label: "j", tone: "compare" }],
      [],
      [],
    ]);
    expect(first.tones).toEqual(["pivot", "compare", "default", "default"]);
    expect(first.bracket).toEqual({
      from: 0,
      to: 1,
      label: "3 < 5",
      tone: "compare",
    });

    const third = getSelectionSortFrame(events[2]);
    expect(third.markers[0]).toEqual([{ label: "i", tone: "pointer" }]);
    expect(third.markers[1]).toEqual([{ label: "min", tone: "pivot" }]);
    expect(third.markers[3]).toEqual([{ label: "j", tone: "compare" }]);
    expect(third.bracket?.label).toBe("1 < 3");
  });

  test("min không đổi thì ngoặc ghi ≥", () => {
    const { events } = selectionSort.execute([1, 2]);
    expect(getSelectionSortFrame(events[0]).bracket?.label).toBe("2 ≥ 1");
  });

  test("i theo kịp đoạn đã sắp xếp ở các lượt sau", () => {
    const { events } = selectionSort.execute([5, 3, 8, 1]);
    const frame = getSelectionSortFrame(events[5]);
    expect(frame.markers[0]).toEqual([]);
    expect(frame.markers[1]).toContainEqual({ label: "i", tone: "pointer" });
    expect(frame.tones[0]).toBe("sorted");
  });

  test("hoán đổi: ngoặc từ i tới min, không còn huy hiệu", () => {
    const { events } = selectionSort.execute([5, 3, 8, 1]);
    const frame = getSelectionSortFrame(events[3]);
    expect(frame.bracket).toEqual({
      from: 0,
      to: 3,
      label: "Hoán đổi",
      tone: "swap",
    });
    expect(frame.markers.every((markers) => markers.length === 0)).toBe(true);
  });

  test("mọi bước của mọi input có tone và huy hiệu cho từng vị trí", () => {
    for (const input of SAMPLE_INPUTS) {
      for (const event of selectionSort.execute(input).events) {
        const frame = getSelectionSortFrame(event);
        expect(frame.tones).toHaveLength(input.length);
        expect(frame.markers).toHaveLength(input.length);
        if (frame.bracket) {
          expect(frame.bracket.from).toBeLessThanOrEqual(frame.bracket.to);
          expect(frame.bracket.to).toBeLessThan(input.length);
        }
      }
    }
  });
});
