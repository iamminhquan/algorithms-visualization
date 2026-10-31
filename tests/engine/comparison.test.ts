import { describe, expect, test } from "bun:test";
import {
  COMPARISON_PARAMS,
  getComparisonTotal,
  getLaneIndex,
  isLaneFinished,
  resolveComparisonPair,
} from "@/engine/visualization";

const SLUGS = ["bubble-sort", "selection-sort", "insertion-sort"];

describe("COMPARISON_PARAMS", () => {
  test("tên tham số URL của hai bên", () => {
    expect(COMPARISON_PARAMS).toEqual({ left: "a", right: "b" });
  });
});

describe("getComparisonTotal", () => {
  test("lấy tổng số bước lớn nhất, mảng rỗng ra 0", () => {
    expect(getComparisonTotal([12, 30])).toBe(30);
    expect(getComparisonTotal([0, 5])).toBe(5);
    expect(getComparisonTotal([])).toBe(0);
  });
});

describe("getLaneIndex", () => {
  test("kẹp chỉ số chung vào phạm vi của dòng thời gian", () => {
    expect(getLaneIndex(5, 10)).toBe(5);
    expect(getLaneIndex(25, 10)).toBe(9);
    expect(getLaneIndex(-3, 10)).toBe(0);
    expect(getLaneIndex(0, 0)).toBe(0);
  });
});

describe("isLaneFinished", () => {
  test("dòng thời gian xong khi chỉ số chung chạm bước cuối", () => {
    expect(isLaneFinished(8, 10)).toBe(false);
    expect(isLaneFinished(9, 10)).toBe(true);
    expect(isLaneFinished(25, 10)).toBe(true);
    expect(isLaneFinished(0, 1)).toBe(true);
    expect(isLaneFinished(0, 0)).toBe(false);
  });
});

describe("resolveComparisonPair", () => {
  test("không chọn gì thì lấy hai thuật toán đầu", () => {
    expect(resolveComparisonPair(SLUGS, undefined, undefined)).toEqual([
      "bubble-sort",
      "selection-sort",
    ]);
  });

  test("giữ bên trái hợp lệ và chọn bên phải khác bên trái", () => {
    expect(resolveComparisonPair(SLUGS, "selection-sort", undefined)).toEqual([
      "selection-sort",
      "bubble-sort",
    ]);
    expect(
      resolveComparisonPair(SLUGS, "selection-sort", "selection-sort"),
    ).toEqual(["selection-sort", "bubble-sort"]);
  });

  test("bên trái trống thì lấy mặc định rồi tránh trùng bên phải", () => {
    expect(resolveComparisonPair(SLUGS, undefined, "bubble-sort")).toEqual([
      "bubble-sort",
      "selection-sort",
    ]);
  });

  test("slug không tồn tại thì rơi về mặc định", () => {
    expect(resolveComparisonPair(SLUGS, "khong-co", "insertion-sort")).toEqual([
      "bubble-sort",
      "insertion-sort",
    ]);
    expect(resolveComparisonPair(SLUGS, "insertion-sort", "khong-co")).toEqual([
      "insertion-sort",
      "bubble-sort",
    ]);
  });

  test("dưới hai thuật toán thì không ghép được", () => {
    expect(
      resolveComparisonPair(["bubble-sort"], undefined, undefined),
    ).toBeUndefined();
    expect(resolveComparisonPair([], undefined, undefined)).toBeUndefined();
  });
});
