import { describe, expect, test } from "bun:test";
import { SORTING_ALGORITHMS } from "@/features/sorting-algorithms";
import { findSortingVisualConfig } from "@/features/sorting-algorithms/visual-configs";

describe("findSortingVisualConfig", () => {
  test("mọi thuật toán sắp xếp đều có cấu hình hình vẽ trỏ về chính nó", () => {
    for (const algorithm of SORTING_ALGORITHMS) {
      expect(findSortingVisualConfig(algorithm.metadata.key)?.algorithm).toBe(
        algorithm,
      );
    }
  });

  test("key không thuộc thuật toán sắp xếp trả về undefined", () => {
    expect(findSortingVisualConfig("linear-search")).toBeUndefined();
    expect(findSortingVisualConfig("constructor")).toBeUndefined();
  });
});
