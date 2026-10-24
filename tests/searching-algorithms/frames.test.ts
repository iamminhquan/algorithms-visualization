import { describe, expect, test } from "bun:test";
import {
  binarySearch,
  getBinarySearchFrame,
} from "@/features/searching-algorithms/binary-search";
import {
  getLinearSearchFrame,
  linearSearch,
} from "@/features/searching-algorithms/linear-search";
import {
  createPointerMarkers,
  getRemainingCount,
} from "@/features/searching-algorithms/visualization";

const SORTED_ARRAYS: readonly (readonly number[])[] = [
  [],
  [7],
  [1, 3, 5, 8],
  [2, 2, 2],
  [3, 9, 10, 19, 27, 38, 43, 55, 64, 82],
];

describe("createPointerMarkers", () => {
  test("gộp con trỏ trùng cột và bỏ con trỏ nằm ngoài mảng", () => {
    expect(
      createPointerMarkers(3, [
        { label: "low", index: 1 },
        { label: "mid", index: 1 },
        { label: "high", index: 3 },
      ]),
    ).toEqual([[], [{ label: "low·mid", tone: "pointer" }], []]);
  });
});

describe("getLinearSearchFrame", () => {
  test("so sánh: cột i tô compare, cột đã xét tô discarded, ngoặc ghi ≠ hoặc =", () => {
    const { events } = linearSearch.execute({ array: [5, 3, 8], target: 8 });

    const second = getLinearSearchFrame(events[1]);
    expect(second.tones).toEqual(["discarded", "compare", "default"]);
    expect(second.markers[1]).toEqual([{ label: "i", tone: "pointer" }]);
    expect(second.bracket).toEqual({
      from: 1,
      to: 1,
      label: "3 ≠ 8",
      tone: "compare",
    });

    expect(getLinearSearchFrame(events[2]).bracket?.label).toBe("8 = 8");
  });

  test("tìm thấy: cột đó tô found", () => {
    const { events } = linearSearch.execute({ array: [5, 3, 8], target: 3 });
    const frame = getLinearSearchFrame(events[events.length - 1]);
    expect(frame.tones).toEqual(["discarded", "found", "default"]);
    expect(frame.bracket?.tone).toBe("found");
  });

  test("không tìm thấy: mọi cột đã bị loại, không còn phần tử nào", () => {
    const { events } = linearSearch.execute({ array: [5, 3], target: 1 });
    const last = events[events.length - 1];
    expect(getLinearSearchFrame(last).tones).toEqual([
      "discarded",
      "discarded",
    ]);
    expect(getRemainingCount(last.state)).toBe(0);
  });
});

describe("getBinarySearchFrame", () => {
  const array = [3, 9, 10, 19, 27, 38, 43, 55, 64, 82];

  test("chọn mid tô pivot, so sánh tô compare kèm ngoặc a[mid] với target", () => {
    const { events } = binarySearch.execute({ array, target: 55 });

    const init = getBinarySearchFrame(events[0]);
    expect(init.markers[0]).toEqual([{ label: "low", tone: "pointer" }]);
    expect(init.markers[9]).toEqual([{ label: "high", tone: "pointer" }]);

    const pick = getBinarySearchFrame(events[1]);
    expect(pick.tones[4]).toBe("pivot");
    expect(pick.markers[4]).toEqual([{ label: "mid", tone: "pointer" }]);
    expect(pick.bracket).toBeUndefined();

    const compare = getBinarySearchFrame(events[2]);
    expect(compare.tones[4]).toBe("compare");
    expect(compare.bracket).toEqual({
      from: 4,
      to: 4,
      label: "27 < 55",
      tone: "compare",
    });
  });

  test("bỏ nửa trái: các cột từ 0 tới mid bị loại, low chuyển sang mid + 1", () => {
    const { events } = binarySearch.execute({ array, target: 55 });
    const frame = getBinarySearchFrame(events[3]);
    expect(frame.tones.slice(0, 5)).toEqual(Array(5).fill("discarded"));
    expect(frame.tones.slice(5)).toEqual(Array(5).fill("default"));
    expect(frame.markers[5]).toEqual([{ label: "low", tone: "pointer" }]);
    expect(getRemainingCount(events[3].state)).toBe(5);
  });

  test("khung vùng tìm kiếm bao đúng [low, high] và biến mất khi vùng rỗng", () => {
    const { events } = binarySearch.execute({ array, target: 55 });
    expect(getBinarySearchFrame(events[0]).range).toEqual({ from: 0, to: 9 });
    expect(getBinarySearchFrame(events[3]).range).toEqual({ from: 5, to: 9 });

    const missing = binarySearch.execute({ array, target: 50 }).events;
    expect(getBinarySearchFrame(missing[missing.length - 1]).range).toBe(
      undefined,
    );
  });

  test("Linear Search không vẽ khung vùng", () => {
    for (const event of linearSearch.execute({ array, target: 55 }).events) {
      expect(getLinearSearchFrame(event).range).toBeUndefined();
    }
  });

  test("tìm thấy: cột đó tô found", () => {
    const { events } = binarySearch.execute({ array, target: 55 });
    const frame = getBinarySearchFrame(events[events.length - 1]);
    expect(frame.tones[7]).toBe("found");
    expect(frame.bracket?.label).toBe("Tìm thấy");
  });

  test("mọi bước của mọi input có tone và huy hiệu cho từng vị trí, mỗi cột nhiều nhất một huy hiệu", () => {
    for (const input of SORTED_ARRAYS) {
      for (const target of [...input, 0, 100]) {
        for (const event of binarySearch.execute({ array: input, target })
          .events) {
          const frame = getBinarySearchFrame(event);
          expect(frame.tones).toHaveLength(input.length);
          expect(frame.markers).toHaveLength(input.length);
          for (const markers of frame.markers) {
            expect(markers.length).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });
});
