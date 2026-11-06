import { describe, expect, test } from "bun:test";
import {
  COMPARISON_PARAMS,
  getComparisonTotal,
  getLaneIndex,
  isLaneFinished,
  resolveComparisonLanes,
} from "@/engine/visualization";

const SLUGS = [
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "quick-sort",
  "merge-sort",
];

describe("COMPARISON_PARAMS", () => {
  test("tên tham số URL của bốn bên", () => {
    expect(COMPARISON_PARAMS).toEqual(["a", "b", "c", "d"]);
  });
});

describe("getComparisonTotal", () => {
  test("lấy tổng số bước lớn nhất, mảng rỗng ra 0", () => {
    expect(getComparisonTotal([12, 30, 18, 24])).toBe(30);
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

describe("resolveComparisonLanes", () => {
  test("không chọn gì thì lấy bốn thuật toán đầu", () => {
    expect(resolveComparisonLanes(SLUGS, [])).toEqual([
      "bubble-sort",
      "selection-sort",
      "insertion-sort",
      "quick-sort",
    ]);
    expect(
      resolveComparisonLanes(SLUGS, [
        undefined,
        undefined,
        undefined,
        undefined,
      ]),
    ).toEqual([
      "bubble-sort",
      "selection-sort",
      "insertion-sort",
      "quick-sort",
    ]);
  });

  test("giữ thứ tự đã chọn và bù các thuật toán còn thiếu", () => {
    expect(
      resolveComparisonLanes(SLUGS, [
        "quick-sort",
        undefined,
        "bubble-sort",
        undefined,
      ]),
    ).toEqual([
      "quick-sort",
      "bubble-sort",
      "selection-sort",
      "insertion-sort",
    ]);
  });

  test("bỏ qua lựa chọn trùng và slug không tồn tại", () => {
    expect(
      resolveComparisonLanes(SLUGS, [
        "merge-sort",
        "merge-sort",
        "khong-co",
        "insertion-sort",
      ]),
    ).toEqual([
      "merge-sort",
      "insertion-sort",
      "bubble-sort",
      "selection-sort",
    ]);
  });

  test("danh mục có ít hơn bốn thuật toán thì trả đủ số hiện có", () => {
    expect(
      resolveComparisonLanes(SLUGS.slice(0, 3), [
        "insertion-sort",
        undefined,
        undefined,
        undefined,
      ]),
    ).toEqual(["insertion-sort", "bubble-sort", "selection-sort"]);
    expect(resolveComparisonLanes(SLUGS.slice(0, 2), [])).toEqual([
      "bubble-sort",
      "selection-sort",
    ]);
  });

  test("dưới hai thuật toán thì không ghép được", () => {
    expect(
      resolveComparisonLanes(["bubble-sort"], [undefined, undefined]),
    ).toBeUndefined();
    expect(resolveComparisonLanes([], [])).toBeUndefined();
  });
});
