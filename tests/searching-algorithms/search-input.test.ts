import { describe, expect, test } from "bun:test";
import {
  DEFAULT_ARRAY,
  RANDOM_MAX_VALUE,
  RANDOM_MIN_VALUE,
} from "@/engine/visualization";
import { binarySearch } from "@/features/searching-algorithms/binary-search";
import { linearSearch } from "@/features/searching-algorithms/linear-search";
import {
  DEFAULT_TARGET,
  pickRandomTarget,
  sortAscending,
} from "@/features/searching-algorithms/search-input";

/**
 * Nguồn ngẫu nhiên trả lần lượt các giá trị cho trước, để chọn đúng nhánh cần kiểm tra.
 */
function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

describe("input mặc định", () => {
  test("target có trong mảng, Binary Search cần ít lần so sánh hơn Linear Search", () => {
    const linear = linearSearch.execute({
      array: DEFAULT_ARRAY,
      target: DEFAULT_TARGET,
    });
    const binary = binarySearch.execute({
      array: sortAscending(DEFAULT_ARRAY),
      target: DEFAULT_TARGET,
    });
    expect(linear.output).toBeGreaterThanOrEqual(0);
    expect(binary.output).toBeGreaterThanOrEqual(0);
    expect(binary.metrics.comparisons).toBeLessThan(linear.metrics.comparisons);
  });
});

describe("sortAscending", () => {
  test("sắp xếp theo giá trị số trên bản sao", () => {
    const values = [10, 9, -1, 100];
    expect(sortAscending(values)).toEqual([-1, 9, 10, 100]);
    expect(values).toEqual([10, 9, -1, 100]);
  });
});

describe("pickRandomTarget", () => {
  const values = [5, 20, 40];

  test("nhánh có trong mảng chọn một phần tử của mảng", () => {
    expect(pickRandomTarget(values, sequence(0, 0.5))).toBe(20);
  });

  test("nhánh không có chọn số trong khoảng ngẫu nhiên mà mảng không chứa", () => {
    for (const pick of [0, 0.5, 0.999_999]) {
      const target = pickRandomTarget(values, sequence(0.9, pick));
      expect(values).not.toContain(target);
      expect(target).toBeGreaterThanOrEqual(RANDOM_MIN_VALUE);
      expect(target).toBeLessThanOrEqual(RANDOM_MAX_VALUE);
    }
  });

  test("mảng rỗng vẫn chọn được số", () => {
    const target = pickRandomTarget([], sequence(0, 0));
    expect(target).toBe(RANDOM_MIN_VALUE);
  });
});
