import { describe, expect, test } from "bun:test";
import {
  MIN_BAR_HEIGHT_PERCENT,
  scaleBarHeights,
} from "@/engine/visualization";
import { SORTING_ALGORITHMS } from "@/features/sorting-algorithms";
import { bubbleSort } from "@/features/sorting-algorithms/bubble-sort";
import { selectionSort } from "@/features/sorting-algorithms/selection-sort";
import {
  getBarTones,
  trackElementIds,
} from "@/features/sorting-algorithms/visualization";

const sortAscending = (values: readonly number[]) =>
  [...values].sort((a, b) => a - b);

const DUPLICATE_INPUTS: readonly (readonly number[])[] = [
  [2, 2, 2, 2],
  [3, 1, 3, 2, 1],
  [2, 1, 2, 1],
  [0, -1, 0, -1],
  [3, 3, 2, 2, 1, 1],
];

const SORTED_INPUTS: readonly (readonly number[])[] = [
  [1, 2],
  [1, 2, 3, 4, 5],
  [-3, 0, 0, 4, 4, 9],
];

const REVERSED_INPUTS: readonly (readonly number[])[] = [
  [2, 1],
  [5, 4, 3, 2, 1],
  [9, 4, 4, 0, 0, -3],
];

const asCases = (inputs: readonly (readonly number[])[]) =>
  inputs.map((input) => [JSON.stringify(input), input] as const);

for (const algorithm of SORTING_ALGORITHMS) {
  describe(`${algorithm.metadata.key}: trường hợp biên`, () => {
    describe("mảng rỗng", () => {
      test("chỉ có sự kiện complete, không so sánh hay hoán đổi", () => {
        const { output, events, metrics } = algorithm.execute([]);

        expect(output).toEqual([]);
        expect(metrics).toEqual({ comparisons: 0, swaps: 0, writes: 0 });
        expect(events).toHaveLength(1);
        expect(events[0].payload).toEqual({ type: "complete" });
        expect(events[0].description).toBe(
          "Hoàn tất: 0 lần so sánh, 0 lần hoán đổi",
        );
        expect(events[0].state).toEqual({ array: [], sortedIndices: [] });
      });

      test("không có cột nào để tô hay theo dõi", () => {
        const { events } = algorithm.execute([]);

        expect(getBarTones(events[0])).toEqual([]);
        expect(trackElementIds(0, events)).toEqual([[]]);
      });
    });

    describe("một phần tử", () => {
      test.each([
        [7],
        [0],
        [-5],
      ])("[%p] chỉ được chốt rồi hoàn tất", (value) => {
        const { output, events, metrics } = algorithm.execute([value]);

        expect(output).toEqual([value]);
        expect(metrics).toEqual({ comparisons: 0, swaps: 0, writes: 0 });
        expect(events.map((event) => event.payload)).toEqual([
          { type: "mark-sorted", indices: [0] },
          { type: "complete" },
        ]);
        expect(events.map((event) => event.description)).toEqual([
          `${value} đã vào đúng vị trí`,
          "Hoàn tất: 0 lần so sánh, 0 lần hoán đổi",
        ]);
        for (const event of events) {
          expect(event.state).toEqual({ array: [value], sortedIndices: [0] });
          expect(getBarTones(event)).toEqual(["sorted"]);
        }
      });
    });

    describe("phần tử trùng nhau", () => {
      test.each(
        asCases(DUPLICATE_INPUTS),
      )("%s sắp xếp đúng và giữ đủ mọi giá trị", (_, input) => {
        const { output } = algorithm.execute(input);
        expect(output).toEqual(sortAscending(input));
      });

      test.each(
        asCases(DUPLICATE_INPUTS),
      )("%s không bao giờ hoán đổi hai giá trị bằng nhau", (_, input) => {
        const { events } = algorithm.execute(input);
        for (const [step, event] of events.entries()) {
          if (event.payload.type !== "swap") {
            continue;
          }
          const before = step === 0 ? input : events[step - 1].state.array;
          const [i, j] = event.payload.indices;
          expect(before[i]).not.toBe(before[j]);
        }
      });

      test("mảng toàn giá trị bằng nhau không có lần hoán đổi nào", () => {
        const input = [2, 2, 2, 2];
        const { output, events, metrics } = algorithm.execute(input);

        expect(output).toEqual(input);
        expect(metrics.swaps).toBe(0);
        expect(metrics.writes).toBe(0);
        expect(trackElementIds(input.length, events).at(-1)).toEqual([
          0, 1, 2, 3,
        ]);
        for (const event of events) {
          expect(event.state.array).toEqual(input);
        }
      });
    });

    describe("mảng đã sắp xếp", () => {
      test.each(
        asCases(SORTED_INPUTS),
      )("%s không hoán đổi và mảng giữ nguyên ở mọi bước", (_, input) => {
        const { output, events, metrics } = algorithm.execute(input);

        expect(output).toEqual(input);
        expect(metrics.swaps).toBe(0);
        expect(metrics.writes).toBe(0);
        expect(events.some((event) => event.payload.type === "swap")).toBe(
          false,
        );
        for (const event of events) {
          expect(event.state.array).toEqual(input);
        }
        expect(events.at(-1)?.state.sortedIndices).toEqual(
          input.map((_, index) => index),
        );
      });
    });

    describe("mảng sắp xếp ngược", () => {
      test.each(
        asCases(REVERSED_INPUTS),
      )("%s được đảo về tăng dần", (_, input) => {
        const { output, events } = algorithm.execute(input);

        expect(output).toEqual(sortAscending(input));
        expect(output).toEqual([...input].reverse());
        expect(events.at(-1)?.state.array).toEqual(output);
      });
    });
  });
}

describe("bubbleSort: trường hợp biên", () => {
  test("mảng đã sắp xếp chỉ chạy một lượt n - 1 lần so sánh rồi dừng sớm", () => {
    const input = [1, 2, 3, 4, 5];
    const { events, metrics } = bubbleSort.execute(input);

    expect(metrics.comparisons).toBe(input.length - 1);
    expect(events.map((event) => event.payload.type)).toEqual([
      "compare",
      "compare",
      "compare",
      "compare",
      "mark-sorted",
      "complete",
    ]);
  });

  test("mảng ngược có n(n-1)/2 lần so sánh và đổi chỗ, mỗi lượt chốt một phần tử", () => {
    const { events, metrics } = bubbleSort.execute([5, 4, 3, 2, 1]);

    expect(metrics).toEqual({ comparisons: 10, swaps: 10, writes: 20 });
    expect(
      events
        .filter((event) => event.payload.type === "mark-sorted")
        .map((event) => event.payload),
    ).toEqual([
      { type: "mark-sorted", indices: [4] },
      { type: "mark-sorted", indices: [3] },
      { type: "mark-sorted", indices: [2] },
      { type: "mark-sorted", indices: [1] },
      { type: "mark-sorted", indices: [0] },
    ]);
  });

  test("mảng ngược có phần tử trùng không đổi chỗ các cặp bằng nhau", () => {
    /*
     * 15 cặp, trừ 3 cặp bằng nhau (3-3, 2-2, 1-1) thì còn 12 cặp sai thứ tự.
     */
    expect(bubbleSort.execute([3, 3, 2, 2, 1, 1]).metrics.swaps).toBe(12);
  });

  test("ổn định: các giá trị bằng nhau giữ thứ tự ban đầu", () => {
    const input = [2, 1, 2, 1];
    const { events } = bubbleSort.execute(input);
    expect(trackElementIds(input.length, events).at(-1)).toEqual([1, 3, 0, 2]);
  });
});

describe("selectionSort: trường hợp biên", () => {
  test("mảng đã sắp xếp vẫn so sánh đủ n(n-1)/2 lần và chốt từng phần tử", () => {
    const { events, metrics } = selectionSort.execute([1, 2, 3, 4, 5]);

    expect(metrics).toEqual({ comparisons: 10, swaps: 0, writes: 0 });
    expect(
      events
        .filter((event) => event.payload.type === "mark-sorted")
        .map((event) => event.payload),
    ).toEqual(
      [0, 1, 2, 3, 4].map((index) => ({
        type: "mark-sorted",
        indices: [index],
      })),
    );
  });

  test("mảng ngược chỉ cần ⌊n/2⌋ lần đổi chỗ", () => {
    /*
     * Mỗi lần đổi chỗ đưa đồng thời hai đầu của đoạn chưa sắp xếp về đúng vị trí.
     */
    const { events, metrics } = selectionSort.execute([5, 4, 3, 2, 1]);

    expect(metrics).toEqual({ comparisons: 10, swaps: 2, writes: 4 });
    expect(
      events
        .filter((event) => event.payload.type === "swap")
        .map((event) => event.payload),
    ).toEqual([
      { type: "swap", indices: [0, 4] },
      { type: "swap", indices: [1, 3] },
    ]);
  });

  test("có nhiều giá trị nhỏ nhất thì chọn giá trị đứng trước", () => {
    const { events } = selectionSort.execute([2, 1, 1]);
    expect(
      events.find((event) => event.payload.type === "swap")?.payload,
    ).toEqual({ type: "swap", indices: [0, 1] });
  });

  test("không ổn định: hoán đổi xa có thể đảo thứ tự hai giá trị bằng nhau", () => {
    const input = [2, 2, 1];
    const { output, events } = selectionSort.execute(input);

    expect(output).toEqual([1, 2, 2]);
    expect(trackElementIds(input.length, events).at(-1)).toEqual([2, 1, 0]);
  });
});

describe("chiều cao cột: trường hợp biên", () => {
  test("mảng rỗng không có cột", () => {
    expect(scaleBarHeights([])).toEqual([]);
  });

  test("một phần tử dương cao hết vùng vẽ, số 0 hoặc số âm cao tối thiểu", () => {
    expect(scaleBarHeights([7])).toEqual([100]);
    expect(scaleBarHeights([0])).toEqual([MIN_BAR_HEIGHT_PERCENT]);
    expect(scaleBarHeights([-5])).toEqual([MIN_BAR_HEIGHT_PERCENT]);
  });

  test("các giá trị bằng nhau có cùng chiều cao", () => {
    expect(scaleBarHeights([4, 4, 4])).toEqual([100, 100, 100]);
    expect(scaleBarHeights([-3, -3])).toEqual([
      MIN_BAR_HEIGHT_PERCENT,
      MIN_BAR_HEIGHT_PERCENT,
    ]);
  });

  test("mảng đã sắp xếp cho chiều cao tăng dần, mảng ngược cho chiều cao giảm dần", () => {
    const ascending = scaleBarHeights([-3, 0, 0, 4, 9]);
    for (let i = 1; i < ascending.length; i++) {
      expect(ascending[i]).toBeGreaterThanOrEqual(ascending[i - 1]);
    }
    expect(scaleBarHeights([9, 4, 0, 0, -3])).toEqual([...ascending].reverse());
  });
});
