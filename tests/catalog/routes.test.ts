import { describe, expect, test } from "bun:test";
import { getCompareHref } from "@/features/catalog/routes";

describe("getCompareHref", () => {
  test("không có cặp thì chỉ trỏ tới trang so sánh", () => {
    expect(getCompareHref("sorting")).toBe("/visualization/sorting/compare");
  });

  test("có cặp thì thêm tham số a và b", () => {
    expect(getCompareHref("sorting", ["bubble-sort", "selection-sort"])).toBe(
      "/visualization/sorting/compare?a=bubble-sort&b=selection-sort",
    );
  });
});
