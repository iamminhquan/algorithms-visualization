import { describe, expect, test } from "bun:test";
import { countPayloadTypes } from "@/engine/visualization";
import { bubbleSort } from "@/features/sorting-algorithms/bubble-sort";

describe("countPayloadTypes", () => {
  test("đếm dồn từng loại thao tác, tính cả sự kiện đang xét", () => {
    const { events } = bubbleSort.execute([3, 1, 2]);
    const counts = countPayloadTypes(events, ["compare", "swap"]);

    expect(counts).toHaveLength(events.length);
    for (const [index, count] of counts.entries()) {
      const seen = events.slice(0, index + 1);
      expect(count).toEqual({
        compare: seen.filter((event) => event.payload.type === "compare")
          .length,
        swap: seen.filter((event) => event.payload.type === "swap").length,
      });
    }
  });

  test("bộ đếm ở sự kiện cuối khớp với metrics của cả lần chạy", () => {
    const { events, metrics } = bubbleSort.execute([5, 4, 3, 2, 1]);
    const last = countPayloadTypes(events, ["compare", "swap"]).at(-1);
    expect(last).toEqual({
      compare: metrics.comparisons,
      swap: metrics.swaps,
    });
  });

  test("mỗi bước là một ảnh chụp riêng, không bị các bước sau sửa", () => {
    const { events } = bubbleSort.execute([2, 1]);
    const counts = countPayloadTypes(events, ["swap"]);
    expect(counts[0]).toEqual({ swap: 0 });
    expect(counts.at(-1)).toEqual({ swap: 1 });
    expect(Object.isFrozen(counts[0])).toBe(true);
  });

  test("vết rỗng cho ra mảng rỗng", () => {
    expect(countPayloadTypes([], [])).toEqual([]);
  });
});
