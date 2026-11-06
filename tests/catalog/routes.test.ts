import { describe, expect, test } from "bun:test";
import { getCompareHref } from "@/features/catalog/routes";

describe("getCompareHref", () => {
  test("không có danh sách thì chỉ trỏ tới trang so sánh", () => {
    expect(getCompareHref("sorting")).toBe("/visualization/sorting/compare");
  });

  test("có danh sách thì thêm tham số a và b", () => {
    expect(getCompareHref("sorting", ["bubble-sort", "selection-sort"])).toBe(
      "/visualization/sorting/compare?a=bubble-sort&b=selection-sort",
    );
  });

  test("đủ bốn thuật toán thì thêm tham số a, b, c và d", () => {
    expect(
      getCompareHref("sorting", [
        "bubble-sort",
        "selection-sort",
        "insertion-sort",
        "quick-sort",
      ]),
    ).toBe(
      "/visualization/sorting/compare?a=bubble-sort&b=selection-sort&c=insertion-sort&d=quick-sort",
    );
  });
});
