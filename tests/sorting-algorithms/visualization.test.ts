import { describe, expect, test } from "bun:test";
import { SORTING_ALGORITHMS } from "@/features/sorting-algorithms";
import { bubbleSort } from "@/features/sorting-algorithms/bubble-sort";
import {
  getBarTones,
  type SortingEvent,
  trackElementIds,
} from "@/features/sorting-algorithms/visualization";

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [],
  [7],
  [5, 3, 8, 1],
  [5, 4, 3, 2, 1],
  [3, 1, 3, 2, 1],
  [2, 2, 2],
];

function findEvent(
  events: readonly SortingEvent[],
  type: SortingEvent["payload"]["type"],
): SortingEvent {
  const event = events.find((candidate) => candidate.payload.type === type);
  if (!event) {
    throw new Error(`Vết không có sự kiện "${type}"`);
  }
  return event;
}

describe("getBarTones", () => {
  test("tô các cột đang so sánh, đang hoán đổi và đã đúng vị trí", () => {
    const { events } = bubbleSort.execute([3, 1, 2]);

    expect(getBarTones(findEvent(events, "compare"))).toEqual([
      "compare",
      "compare",
      "default",
    ]);
    expect(getBarTones(findEvent(events, "swap"))).toEqual([
      "swap",
      "swap",
      "default",
    ]);
    expect(getBarTones(findEvent(events, "mark-sorted"))).toEqual([
      "default",
      "default",
      "sorted",
    ]);
    expect(getBarTones(findEvent(events, "complete"))).toEqual([
      "sorted",
      "sorted",
      "sorted",
    ]);
  });

  test("mỗi cột có đúng một tone ở mọi bước của mọi thuật toán", () => {
    for (const algorithm of SORTING_ALGORITHMS) {
      for (const input of SAMPLE_INPUTS) {
        for (const event of algorithm.execute(input).events) {
          expect(getBarTones(event)).toHaveLength(input.length);
        }
      }
    }
  });
});

describe("trackElementIds", () => {
  test("định danh luôn trỏ về đúng phần tử ban đầu đang nằm ở mỗi vị trí", () => {
    for (const algorithm of SORTING_ALGORITHMS) {
      for (const input of SAMPLE_INPUTS) {
        const { events } = algorithm.execute(input);
        const ids = trackElementIds(input.length, events);

        expect(ids).toHaveLength(events.length);
        for (const [step, event] of events.entries()) {
          expect(ids[step].map((id) => input[id])).toEqual([
            ...event.state.array,
          ]);
          expect([...ids[step]].sort((a, b) => a - b)).toEqual(
            input.map((_, index) => index),
          );
        }
      }
    }
  });

  test("giá trị trùng nhau vẫn giữ định danh riêng khi bị đổi chỗ", () => {
    const { events } = bubbleSort.execute([2, 1, 2]);
    const ids = trackElementIds(3, events);
    expect(ids.at(-1)).toEqual([1, 0, 2]);
  });
});
