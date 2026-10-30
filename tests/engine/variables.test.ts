import { describe, expect, test } from "bun:test";
import { elementAt } from "@/engine/visualization";

describe("elementAt", () => {
  test("trả giá trị khi chỉ số nằm trong mảng", () => {
    expect(elementAt([4, 6, 7], 1)).toBe(6);
  });

  test("trả undefined khi chưa có chỉ số hoặc chỉ số nằm ngoài mảng", () => {
    expect(elementAt([4, 6, 7], undefined)).toBeUndefined();
    expect(elementAt([4, 6, 7], -1)).toBeUndefined();
    expect(elementAt([4, 6, 7], 3)).toBeUndefined();
  });
});
