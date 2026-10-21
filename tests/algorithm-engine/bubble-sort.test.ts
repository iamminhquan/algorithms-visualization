import { describe, expect, test } from "bun:test";
import {
  type BubbleSortResult,
  bubbleSort,
  MAX_INPUT_LENGTH,
} from "@/features/algorithm/algorithms/sorting/bubble-sort";

const sortAscending = (values: readonly number[]) =>
  [...values].sort((a, b) => a - b);

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [],
  [7],
  [5, 3, 8, 1],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [3, 1, 3, 2, 1],
  [0, -5, 3, -1, -5],
  [2, 2, 2],
];

/**
 * Phát lại vết thực thi trên một bản sao của input, chỉ dựa vào payload, rồi đối chiếu
 * với ảnh chụp trong từng sự kiện. Nếu khớp toàn bộ, vết đủ để giải thích quá trình chạy.
 */
function expectTraceReplaysToOutput(
  input: readonly number[],
  result: BubbleSortResult,
) {
  const replay = [...input];
  const marked = new Set<number>();

  for (const [step, event] of result.events.entries()) {
    const before = [...replay];
    const { payload } = event;

    switch (payload.type) {
      case "compare": {
        const [i, j] = payload.indices;
        expect(j).toBe(i + 1);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(j).toBeLessThan(input.length);
        expect(marked.has(i) || marked.has(j)).toBe(false);
        /*
         * Sau một lần so sánh, đổi chỗ xảy ra khi và chỉ khi cặp này sai thứ tự.
         */
        const next = result.events[step + 1]?.payload;
        const swapsNext =
          next?.type === "swap" &&
          next.indices[0] === i &&
          next.indices[1] === j;
        expect(swapsNext).toBe(before[i] > before[j]);
        break;
      }
      case "swap": {
        const [i, j] = payload.indices;
        expect(before[i]).toBeGreaterThan(before[j]);
        [replay[i], replay[j]] = [replay[j], replay[i]];
        break;
      }
      case "mark-sorted":
        for (const index of payload.indices) {
          expect(marked.has(index)).toBe(false);
          marked.add(index);
        }
        break;
      case "complete":
        expect(step).toBe(result.events.length - 1);
        break;
      default: {
        const unreachable: never = payload;
        throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }

    expect(event.state.array).toEqual(replay);
    expect(event.state.sortedIndices).toEqual(
      [...marked].sort((a, b) => a - b),
    );
  }

  expect(replay).toEqual([...result.output]);
  expect(marked.size).toBe(input.length);
}

describe("bubbleSort: kết quả", () => {
  test("sắp xếp [5, 3, 8, 1] thành [1, 3, 5, 8]", () => {
    expect(bubbleSort.execute([5, 3, 8, 1]).output).toEqual([1, 3, 5, 8]);
  });

  test.each([
    ["mảng đã sắp xếp", [1, 2, 3, 4, 5]],
    ["mảng sắp xếp ngược", [5, 4, 3, 2, 1]],
    ["có phần tử trùng", [3, 1, 3, 2, 1]],
    ["có số âm", [0, -5, 3, -1, -5]],
    ["một phần tử", [7]],
    ["mảng rỗng", []],
  ])("%s", (_, input) => {
    const { output } = bubbleSort.execute(input);
    expect(output).toEqual(sortAscending(input));
    expect(output).toHaveLength(input.length);
  });

  test("không thay đổi mảng của người gọi", () => {
    const input = [4, 2, 9, 1];
    const result = bubbleSort.execute(input);
    expect(input).toEqual([4, 2, 9, 1]);
    expect(result.output).not.toBe(input);
    /*
     * Input bị đóng băng vẫn chạy được, chứng tỏ thuật toán không ghi vào nó.
     */
    expect(bubbleSort.execute(Object.freeze([3, 1, 2])).output).toEqual([
      1, 2, 3,
    ]);
  });

  test("từ chối NaN vì không so sánh được", () => {
    expect(() => bubbleSort.execute([1, Number.NaN, 2])).toThrow(RangeError);
  });

  test("từ chối đầu vào dài hơn giới hạn", () => {
    const atLimit = Array.from({ length: MAX_INPUT_LENGTH }, (_, i) => -i);
    expect(bubbleSort.execute(atLimit).output).toEqual(sortAscending(atLimit));
    expect(() => bubbleSort.execute([...atLimit, 0])).toThrow(RangeError);
  });

  test("gắn metadata của thuật toán vào kết quả", () => {
    expect(bubbleSort.execute([1]).metadata).toEqual({
      id: "sorting.bubble-sort",
      name: "Sắp xếp nổi bọt (Bubble Sort)",
      category: "sorting",
      description: expect.any(String),
    });
  });
});

describe("bubbleSort: vết thực thi", () => {
  test("ghi đúng chuỗi thao tác cho [5, 3, 8, 1]", () => {
    const { events } = bubbleSort.execute([5, 3, 8, 1]);
    expect(events.map((event) => event.payload)).toEqual([
      { type: "compare", indices: [0, 1] },
      { type: "swap", indices: [0, 1] },
      { type: "compare", indices: [1, 2] },
      { type: "compare", indices: [2, 3] },
      { type: "swap", indices: [2, 3] },
      { type: "mark-sorted", indices: [3] },
      { type: "compare", indices: [0, 1] },
      { type: "compare", indices: [1, 2] },
      { type: "swap", indices: [1, 2] },
      { type: "mark-sorted", indices: [2] },
      { type: "compare", indices: [0, 1] },
      { type: "swap", indices: [0, 1] },
      { type: "mark-sorted", indices: [1] },
      { type: "mark-sorted", indices: [0] },
      { type: "complete" },
    ]);
    expect(events[1].state.array).toEqual([3, 5, 8, 1]);
    expect(events.at(-1)?.state.array).toEqual([1, 3, 5, 8]);
  });

  test.each(
    SAMPLE_INPUTS.map((input) => [JSON.stringify(input), input] as const),
  )("phát lại vết của %s khớp với ảnh chụp và kết quả", (_, input) => {
    expectTraceReplaysToOutput(input, bubbleSort.execute(input));
  });

  test("kết thúc bằng đúng một sự kiện complete", () => {
    for (const input of SAMPLE_INPUTS) {
      const { events } = bubbleSort.execute(input);
      const completes = events.filter(
        (event) => event.payload.type === "complete",
      );
      expect(completes).toHaveLength(1);
      expect(events.at(-1)?.payload.type).toBe("complete");
    }
  });

  test("mảng rỗng chỉ có sự kiện complete", () => {
    const { events, metrics } = bubbleSort.execute([]);
    expect(events.map((event) => event.payload.type)).toEqual(["complete"]);
    expect(metrics).toEqual({ comparisons: 0, swaps: 0, writes: 0 });
  });

  test("dừng sớm khi một lượt không có lần đổi chỗ nào", () => {
    const { events, metrics } = bubbleSort.execute([1, 2, 3, 4, 5]);
    expect(metrics).toEqual({ comparisons: 4, swaps: 0, writes: 0 });
    expect(events.at(-2)?.payload).toEqual({
      type: "mark-sorted",
      indices: [0, 1, 2, 3, 4],
    });
  });

  test("ảnh chụp của từng sự kiện độc lập và không sửa được", () => {
    const result = bubbleSort.execute([3, 2, 1]);
    const snapshots = result.events.map((event) => event.state.array);

    expect(new Set(snapshots).size).toBe(snapshots.length);
    expect(snapshots[0]).toEqual([3, 2, 1]);
    expect(Object.isFrozen(snapshots[0])).toBe(true);
    /*
     * Ép bỏ `readonly` để thử ghi lúc chạy: mảng đã bị đóng băng nên phải ném TypeError.
     */
    expect(() => {
      (snapshots[0] as number[])[0] = 99;
    }).toThrow(TypeError);

    /*
     * Sửa output của người gọi không ảnh hưởng tới vết đã ghi. Ép bỏ `readonly` vì
     * người gọi ngoài TypeScript vẫn có thể sửa mảng này.
     */
    (result.output as number[]).reverse();
    expect(result.events.at(-1)?.state.array).toEqual([1, 2, 3]);
  });

  test("mô tả phản ánh đúng thao tác và giá trị", () => {
    const { events } = bubbleSort.execute([5, 3]);
    expect(events.map((event) => event.description)).toEqual([
      "So sánh 5 (vị trí 0) với 3 (vị trí 1): 5 > 3 nên cần đổi chỗ",
      "Đổi chỗ 5 và 3: 3 về vị trí 0, 5 về vị trí 1",
      "5 đã nằm đúng vị trí cuối cùng 1",
      "3 là phần tử cuối cùng còn lại nên đã nằm đúng vị trí 0",
      "Hoàn tất: mảng đã được sắp xếp tăng dần sau 1 lần so sánh và 1 lần đổi chỗ",
    ]);
    expect(bubbleSort.execute([1, 2]).events[0].description).toBe(
      "So sánh 1 (vị trí 0) với 2 (vị trí 1): 1 ≤ 2 nên giữ nguyên",
    );
  });

  test("chỉ số đo khớp với các sự kiện đã ghi", () => {
    for (const input of SAMPLE_INPUTS) {
      const { events, metrics } = bubbleSort.execute(input);
      const count = (type: string) =>
        events.filter((event) => event.payload.type === type).length;

      expect(metrics.comparisons).toBe(count("compare"));
      expect(metrics.swaps).toBe(count("swap"));
      expect(metrics.writes).toBe(metrics.swaps * 2);
    }
    /*
     * Mảng ngược n phần tử: mọi cặp đều sai thứ tự nên có n(n-1)/2 lần đổi chỗ.
     */
    expect(bubbleSort.execute([5, 4, 3, 2, 1]).metrics).toEqual({
      comparisons: 10,
      swaps: 10,
      writes: 20,
    });
  });
});

describe("bubbleSort: tính tất định", () => {
  test("cùng input cho cùng kết quả, vết và chỉ số đo", () => {
    for (const input of SAMPLE_INPUTS) {
      const first = bubbleSort.execute(input);
      const second = bubbleSort.execute(input);
      expect(second.output).toEqual(first.output);
      expect(second.events).toEqual(first.events);
      expect(second.metrics).toEqual(first.metrics);
    }
  });
});
