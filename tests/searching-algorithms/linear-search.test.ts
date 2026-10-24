import { describe, expect, test } from "bun:test";
import {
  LINEAR_SEARCH_KEY,
  linearSearch,
} from "@/features/searching-algorithms/linear-search";

const SAMPLE_ARRAYS: readonly (readonly number[])[] = [
  [],
  [7],
  [5, 3, 8, 1],
  [3, 1, 3, 2, 1],
  [0, -5, 3, -1, -5],
];

describe("linearSearch", () => {
  test("metadata đúng key", () => {
    expect(linearSearch.metadata.key).toBe(LINEAR_SEARCH_KEY);
  });

  test("trả về vị trí xuất hiện đầu tiên, khớp với indexOf", () => {
    for (const array of SAMPLE_ARRAYS) {
      for (const target of [...array, 100, -100]) {
        const { output } = linearSearch.execute({ array, target });
        expect(output).toBe(array.indexOf(target));
      }
    }
  });

  test("tìm thấy ở đầu, giữa, cuối mảng", () => {
    const array = [4, 8, 15, 16, 23];
    expect(linearSearch.execute({ array, target: 4 }).output).toBe(0);
    expect(linearSearch.execute({ array, target: 15 }).output).toBe(2);
    expect(linearSearch.execute({ array, target: 23 }).output).toBe(4);
  });

  test("số lần so sánh bằng vị trí tìm thấy cộng một, hoặc n khi không có", () => {
    const array = [5, 3, 8, 1];
    expect(linearSearch.execute({ array, target: 8 }).metrics.comparisons).toBe(
      3,
    );
    expect(linearSearch.execute({ array, target: 9 }).metrics.comparisons).toBe(
      4,
    );
  });

  test("vết so sánh lần lượt từ 0, kết thúc bằng found hoặc not-found", () => {
    const array = [5, 3, 8, 1];
    const found = linearSearch.execute({ array, target: 8 }).events;
    expect(found.map((event) => event.payload)).toEqual([
      { type: "compare", index: 0 },
      { type: "compare", index: 1 },
      { type: "compare", index: 2 },
      { type: "found", index: 2 },
    ]);

    const missing = linearSearch.execute({ array, target: 9 }).events;
    expect(missing.at(-1)?.payload).toEqual({ type: "not-found" });
    expect(missing.at(-1)?.state.low).toBe(array.length);
  });

  test("so sánh khác nhau thì chính bước đó đã loại phần tử khỏi vùng tìm kiếm", () => {
    const { events } = linearSearch.execute({ array: [5, 3, 8], target: 8 });
    expect(events.map((event) => event.state.low)).toEqual([1, 2, 2, 2]);
    for (const event of events) {
      expect(event.state.high).toBe(2);
    }
  });

  test("mảng rỗng chỉ có một bước không tìm thấy", () => {
    const result = linearSearch.execute({ array: [], target: 1 });
    expect(result.output).toBe(-1);
    expect(result.events.map((event) => event.payload.type)).toEqual([
      "not-found",
    ]);
  });

  test("số lần so sánh bằng số sự kiện compare", () => {
    for (const array of SAMPLE_ARRAYS) {
      const result = linearSearch.execute({ array, target: 3 });
      const compares = result.events.filter(
        (event) => event.payload.type === "compare",
      );
      expect(result.metrics.comparisons).toBe(compares.length);
    }
  });

  test("không sửa input và ảnh chụp đã bị đóng băng", () => {
    const array = [5, 3, 8, 1];
    const { events } = linearSearch.execute({ array, target: 1 });
    expect(array).toEqual([5, 3, 8, 1]);
    for (const event of events) {
      expect(Object.isFrozen(event)).toBe(true);
      expect(Object.isFrozen(event.state)).toBe(true);
      expect(Object.isFrozen(event.state.array)).toBe(true);
    }
  });

  test("NaN trong mảng hoặc ở target bị từ chối", () => {
    expect(() =>
      linearSearch.execute({ array: [1, Number.NaN], target: 1 }),
    ).toThrow(RangeError);
    expect(() =>
      linearSearch.execute({ array: [1, 2], target: Number.NaN }),
    ).toThrow(RangeError);
  });
});
