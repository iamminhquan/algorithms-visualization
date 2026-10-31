import { describe, expect, test } from "bun:test";
import {
  DEFAULT_ARRAY,
  nearlySorted,
  sortAscending,
  sortDescending,
} from "@/engine/visualization";

describe("sortAscending và sortDescending", () => {
  test("sắp xếp theo giá trị số và không sửa mảng đầu vào", () => {
    const input = [38, 27, 43, 3];
    expect(sortAscending(input)).toEqual([3, 27, 38, 43]);
    expect(sortDescending(input)).toEqual([43, 38, 27, 3]);
    expect(input).toEqual([38, 27, 43, 3]);
    expect(sortAscending([10, -2, 3])).toEqual([-2, 3, 10]);
  });
});

describe("nearlySorted", () => {
  test("sắp tăng dần rồi hoán đổi các cặp kề cách bốn vị trí", () => {
    expect(nearlySorted(DEFAULT_ARRAY)).toEqual([
      3, 10, 9, 19, 27, 43, 38, 55, 64, 82,
    ]);
  });

  test("xử lý mảng ngắn và giá trị trùng", () => {
    expect(nearlySorted([])).toEqual([]);
    expect(nearlySorted([7])).toEqual([7]);
    expect(nearlySorted([2, 1])).toEqual([1, 2]);
    expect(nearlySorted([3, 1, 2])).toEqual([1, 3, 2]);
    expect(nearlySorted([2, 2, 2])).toEqual([2, 2, 2]);
  });

  test("giữ nguyên tập giá trị và không sửa mảng đầu vào", () => {
    for (const sample of [DEFAULT_ARRAY, [5, 5, 1, 9, -4, 0, 7]]) {
      const copy = [...sample];
      expect(sortAscending(nearlySorted(sample))).toEqual(
        sortAscending(sample),
      );
      expect(sample).toEqual(copy);
    }
  });
});
