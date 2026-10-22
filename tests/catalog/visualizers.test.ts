import { describe, expect, test } from "bun:test";
import { listAlgorithmInfo } from "@/features/catalog/catalog";
import { findVisualizer } from "@/features/catalog/visualizers";

describe("findVisualizer", () => {
  test("mọi thuật toán trong registry đều có trình mô phỏng", () => {
    for (const { key } of listAlgorithmInfo()) {
      expect(findVisualizer(key)).toBeDefined();
    }
  });

  test("key không có trong registry trả về undefined", () => {
    expect(findVisualizer("khong-ton-tai")).toBeUndefined();
    expect(findVisualizer("constructor")).toBeUndefined();
  });
});
