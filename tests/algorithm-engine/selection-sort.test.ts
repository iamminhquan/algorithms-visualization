import { describe, expect, test } from "bun:test";
import {
  MAX_INPUT_LENGTH,
  SELECTION_SORT_KEY,
  type SelectionSortResult,
  selectionSort,
} from "@/features/algorithm/algorithms/sorting/selection-sort";
import { getAlgorithm } from "@/features/algorithm/catalog";

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
 * với ảnh chụp trong từng sự kiện. Đồng thời kiểm tra mỗi lượt thật sự chọn đúng giá trị nhỏ nhất.
 */
function expectTraceReplaysToOutput(
  input: readonly number[],
  result: SelectionSortResult,
) {
  const replay = [...input];
  const marked = new Set<number>();
  let passStart = 0;
  let minIndex = 0;
  let swappedThisPass = false;

  for (const [step, event] of result.events.entries()) {
    const before = [...replay];
    const { payload } = event;

    switch (payload.type) {
      case "compare": {
        const [m, j] = payload.indices;
        expect(m).toBe(minIndex);
        expect(j).toBeGreaterThan(m);
        expect(j).toBeLessThan(input.length);
        expect(marked.has(j)).toBe(false);
        if (before[j] < before[m]) {
          minIndex = j;
        }
        break;
      }
      case "swap": {
        const [i, m] = payload.indices;
        expect([i, m]).toEqual([passStart, minIndex]);
        expect(m).not.toBe(i);
        [replay[i], replay[m]] = [replay[m], replay[i]];
        swappedThisPass = true;
        break;
      }
      case "mark-sorted":
        expect(payload.indices).toEqual([passStart]);
        expect(swappedThisPass).toBe(minIndex !== passStart);
        expect(replay[passStart]).toBe(Math.min(...replay.slice(passStart)));
        marked.add(passStart);
        passStart++;
        minIndex = passStart;
        swappedThisPass = false;
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

describe("selectionSort: kết quả", () => {
  test.each(
    SAMPLE_INPUTS.map((input) => [JSON.stringify(input), input] as const),
  )("sắp xếp %s tăng dần", (_, input) => {
    expect(selectionSort.execute(input).output).toEqual(sortAscending(input));
  });

  test("không thay đổi mảng của người gọi", () => {
    const input = Object.freeze([4, 2, 9, 1]);
    expect(selectionSort.execute(input).output).toEqual([1, 2, 4, 9]);
    expect(input).toEqual([4, 2, 9, 1]);
  });

  test("từ chối NaN và đầu vào dài hơn giới hạn", () => {
    expect(() => selectionSort.execute([1, Number.NaN, 2])).toThrow(RangeError);
    const atLimit = Array.from({ length: MAX_INPUT_LENGTH }, (_, i) => -i);
    expect(selectionSort.execute(atLimit).output).toEqual(
      sortAscending(atLimit),
    );
    expect(() => selectionSort.execute([...atLimit, 0])).toThrow(RangeError);
  });

  test("được đăng ký trong catalog", () => {
    const result = getAlgorithm(SELECTION_SORT_KEY).execute([3, 1, 2]);
    expect(result.output).toEqual([1, 2, 3]);
    expect(result.metadata.key).toBe(SELECTION_SORT_KEY);
  });
});

describe("selectionSort: vết thực thi", () => {
  test("ghi đúng chuỗi thao tác cho [5, 3, 8, 1]", () => {
    const { events, metrics } = selectionSort.execute([5, 3, 8, 1]);
    expect(events.map((event) => event.payload)).toEqual([
      { type: "compare", indices: [0, 1] },
      { type: "compare", indices: [1, 2] },
      { type: "compare", indices: [1, 3] },
      { type: "swap", indices: [0, 3] },
      { type: "mark-sorted", indices: [0] },
      { type: "compare", indices: [1, 2] },
      { type: "compare", indices: [1, 3] },
      { type: "mark-sorted", indices: [1] },
      { type: "compare", indices: [2, 3] },
      { type: "swap", indices: [2, 3] },
      { type: "mark-sorted", indices: [2] },
      { type: "mark-sorted", indices: [3] },
      { type: "complete" },
    ]);
    expect(events[3].state.array).toEqual([1, 3, 8, 5]);
    expect(metrics).toEqual({ comparisons: 6, swaps: 2, writes: 4 });
  });

  test.each(
    SAMPLE_INPUTS.map((input) => [JSON.stringify(input), input] as const),
  )("phát lại vết của %s khớp với ảnh chụp và kết quả", (_, input) => {
    expectTraceReplaysToOutput(input, selectionSort.execute(input));
  });

  test("chỉ số đo khớp với các sự kiện đã ghi", () => {
    for (const input of SAMPLE_INPUTS) {
      const { events, metrics } = selectionSort.execute(input);
      const count = (type: string) =>
        events.filter((event) => event.payload.type === type).length;

      expect(metrics.comparisons).toBe(count("compare"));
      expect(metrics.swaps).toBe(count("swap"));
      expect(metrics.writes).toBe(metrics.swaps * 2);
      /*
       * Selection Sort luôn so sánh đủ n(n-1)/2 lần, bất kể input.
       */
      const n = input.length;
      expect(metrics.comparisons).toBe(n > 0 ? (n * (n - 1)) / 2 : 0);
    }
  });

  test("mô tả phản ánh đúng thao tác và giá trị", () => {
    expect(
      selectionSort.execute([5, 3]).events.map((event) => event.description),
    ).toEqual([
      "So sánh 3 (vị trí 1) với giá trị nhỏ nhất hiện tại 5 (vị trí 0): 3 < 5 nên 3 là giá trị nhỏ nhất mới",
      "Đổi chỗ 5 và 3: 3 về vị trí 0, 5 về vị trí 1",
      "3 đã nằm đúng vị trí cuối cùng 0",
      "5 là phần tử cuối cùng còn lại nên đã nằm đúng vị trí 1",
      "Hoàn tất: mảng đã được sắp xếp tăng dần sau 1 lần so sánh và 1 lần đổi chỗ",
    ]);
    expect(
      selectionSort.execute([1, 2]).events.map((event) => event.description),
    ).toEqual([
      "So sánh 2 (vị trí 1) với giá trị nhỏ nhất hiện tại 1 (vị trí 0): 2 ≥ 1 nên giữ nguyên",
      "1 đã là giá trị nhỏ nhất và nằm sẵn ở vị trí 0 nên không cần đổi chỗ",
      "2 là phần tử cuối cùng còn lại nên đã nằm đúng vị trí 1",
      "Hoàn tất: mảng đã được sắp xếp tăng dần sau 1 lần so sánh và 0 lần đổi chỗ",
    ]);
  });

  test("ảnh chụp của từng sự kiện độc lập và không sửa được", () => {
    const result = selectionSort.execute([3, 2, 1]);
    const snapshots = result.events.map((event) => event.state.array);

    expect(new Set(snapshots).size).toBe(snapshots.length);
    expect(Object.isFrozen(snapshots[0])).toBe(true);
    (result.output as number[]).reverse();
    expect(result.events.at(-1)?.state.array).toEqual([1, 2, 3]);
  });
});
