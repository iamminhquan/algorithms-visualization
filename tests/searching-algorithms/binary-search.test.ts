import { describe, expect, test } from "bun:test";
import {
  BINARY_SEARCH_KEY,
  binarySearch,
} from "@/features/searching-algorithms/binary-search";

const SORTED_ARRAYS: readonly (readonly number[])[] = [
  [],
  [7],
  [1, 3],
  [1, 3, 5, 8],
  [-5, -1, 0, 3, 3, 9, 12],
  [2, 2, 2, 2],
  Array.from({ length: 20 }, (_, index) => index * 5),
];

describe("binarySearch", () => {
  test("metadata đúng key", () => {
    expect(binarySearch.metadata.key).toBe(BINARY_SEARCH_KEY);
  });

  test("tìm thấy đúng giá trị, hoặc -1 khi không có trong mảng", () => {
    for (const array of SORTED_ARRAYS) {
      for (const target of [...array, -100, 100, 4]) {
        const { output } = binarySearch.execute({ array, target });
        if (array.includes(target)) {
          expect(array[output]).toBe(target);
        } else {
          expect(output).toBe(-1);
        }
      }
    }
  });

  test("số lần so sánh không vượt quá ⌊log₂ n⌋ + 1", () => {
    for (const array of SORTED_ARRAYS) {
      const limit =
        array.length === 0 ? 0 : Math.floor(Math.log2(array.length)) + 1;
      for (const target of [...array, -100, 100, 4]) {
        const { metrics } = binarySearch.execute({ array, target });
        expect(metrics.comparisons).toBeLessThanOrEqual(limit);
      }
    }
  });

  test("vết đầy đủ: khởi tạo, chọn mid, so sánh, bỏ một nửa, rồi tìm thấy", () => {
    const { events } = binarySearch.execute({
      array: [3, 9, 10, 19, 27, 38, 43, 55, 64, 82],
      target: 55,
    });
    expect(events.map((event) => event.payload)).toEqual([
      { type: "init" },
      { type: "pick-mid", mid: 4 },
      { type: "compare", mid: 4 },
      { type: "narrow", mid: 4, keep: "right" },
      { type: "pick-mid", mid: 7 },
      { type: "compare", mid: 7 },
      { type: "found", index: 7 },
    ]);
    expect(events[3].state).toMatchObject({ low: 5, high: 9 });
  });

  test("bỏ nửa phải thì high = mid - 1, không tìm thấy thì low > high", () => {
    const { events } = binarySearch.execute({ array: [1, 3, 5], target: 0 });
    const narrow = events.find((event) => event.payload.type === "narrow");
    expect(narrow?.payload).toEqual({ type: "narrow", mid: 1, keep: "left" });
    expect(narrow?.state).toMatchObject({ low: 0, high: 0 });

    const last = events.at(-1);
    expect(last?.payload).toEqual({ type: "not-found" });
    expect(last && last.state.low > last.state.high).toBe(true);
  });

  test("mid luôn nằm trong vùng [low, high] của bước đó", () => {
    for (const array of SORTED_ARRAYS) {
      for (const target of [...array, 100]) {
        for (const { payload, state } of binarySearch.execute({
          array,
          target,
        }).events) {
          if (payload.type === "pick-mid" || payload.type === "compare") {
            expect(payload.mid).toBeGreaterThanOrEqual(state.low);
            expect(payload.mid).toBeLessThanOrEqual(state.high);
          }
        }
      }
    }
  });

  test("mảng rỗng: khởi tạo rồi không tìm thấy", () => {
    const result = binarySearch.execute({ array: [], target: 1 });
    expect(result.output).toBe(-1);
    expect(result.events.map((event) => event.payload.type)).toEqual([
      "init",
      "not-found",
    ]);
  });

  test("từ chối mảng chưa tăng dần và NaN", () => {
    expect(() => binarySearch.execute({ array: [3, 1, 2], target: 1 })).toThrow(
      RangeError,
    );
    expect(() =>
      binarySearch.execute({ array: [1, Number.NaN], target: 1 }),
    ).toThrow(RangeError);
    expect(() =>
      binarySearch.execute({ array: [1, 2], target: Number.NaN }),
    ).toThrow(RangeError);
  });

  test("không sửa input và ảnh chụp đã bị đóng băng", () => {
    const array = [1, 3, 5, 8];
    const { events } = binarySearch.execute({ array, target: 8 });
    expect(array).toEqual([1, 3, 5, 8]);
    for (const event of events) {
      expect(Object.isFrozen(event)).toBe(true);
      expect(Object.isFrozen(event.state)).toBe(true);
      expect(Object.isFrozen(event.state.array)).toBe(true);
    }
  });
});
