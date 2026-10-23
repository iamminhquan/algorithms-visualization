import { describe, expect, test } from "bun:test";
import {
  MIN_BAR_HEIGHT_PERCENT,
  scaleBarHeights,
} from "@/engine/visualization";

describe("scaleBarHeights", () => {
  test("giá trị lớn nhất cao 100%, mọi cột nằm trong khoảng cho phép", () => {
    const heights = scaleBarHeights([5, 10, 2]);
    expect(heights[1]).toBe(100);
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(MIN_BAR_HEIGHT_PERCENT);
      expect(height).toBeLessThanOrEqual(100);
    }
  });

  test("giữ thứ tự cao thấp của các giá trị", () => {
    const heights = scaleBarHeights([3, -2, 7, 0]);
    expect(heights[2]).toBeGreaterThan(heights[0]);
    expect(heights[0]).toBeGreaterThan(heights[3]);
    expect(heights[3]).toBeGreaterThan(heights[1]);
    expect(heights[1]).toBe(MIN_BAR_HEIGHT_PERCENT);
  });

  test("thang đo chứa 0 nên số 0 thấp nhất khi mảng toàn số không âm", () => {
    expect(scaleBarHeights([0, 4])).toEqual([MIN_BAR_HEIGHT_PERCENT, 100]);
  });

  test("mảng toàn số 0 hoặc rỗng không chia cho 0", () => {
    expect(scaleBarHeights([0, 0])).toEqual([
      MIN_BAR_HEIGHT_PERCENT,
      MIN_BAR_HEIGHT_PERCENT,
    ]);
    expect(scaleBarHeights([])).toEqual([]);
  });
});
