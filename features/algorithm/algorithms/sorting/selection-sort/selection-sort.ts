import type { IAlgorithmDefinition, IAlgorithmMetadata } from "../../../engine";
import type {
  SelectionSortEvent,
  SelectionSortInput,
  SelectionSortResult,
  SelectionSortStep,
} from "./types";

export const SELECTION_SORT_ID = "sorting.selection-sort";

/**
 * Mỗi sự kiện chụp lại cả mảng và có tới ~n²/2 sự kiện, nên bộ nhớ tăng ~n³.
 */
export const MAX_INPUT_LENGTH = 100;

const metadata: IAlgorithmMetadata<typeof SELECTION_SORT_ID> = Object.freeze({
  id: SELECTION_SORT_ID,
  name: "Sắp xếp chọn (Selection Sort)",
  category: "sorting",
  description:
    "Ở mỗi lượt, duyệt đoạn chưa sắp xếp để tìm giá trị nhỏ nhất rồi đổi nó về đầu đoạn; " +
    "đoạn đã sắp xếp ở đầu mảng dài thêm một phần tử sau mỗi lượt.",
});

function executeSelectionSort(input: SelectionSortInput): SelectionSortResult {
  if (input.length > MAX_INPUT_LENGTH) {
    throw new RangeError(
      `Dữ liệu đầu vào có ${input.length} phần tử, vượt quá giới hạn ${MAX_INPUT_LENGTH}`,
    );
  }

  for (const [index, value] of input.entries()) {
    if (Number.isNaN(value)) {
      throw new RangeError(
        `Phần tử tại vị trí ${index} không phải là số (NaN)`,
      );
    }
  }

  const array = [...input];
  const events: SelectionSortEvent[] = [];
  let comparisons = 0;
  let swaps = 0;
  let sortedUntil = 0;

  /*
   * Mỗi sự kiện giữ bản sao riêng của mảng, nên các bước sau không làm đổi ảnh chụp trước đó.
   */
  const record = (payload: SelectionSortStep, description: string) => {
    events.push(
      Object.freeze({
        description,
        payload: Object.freeze(payload),
        state: Object.freeze({
          array: Object.freeze([...array]),
          sortedIndices: Object.freeze(range(0, sortedUntil)),
        }),
      }),
    );
  };

  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < array.length; j++) {
      const min = array[minIndex];
      const current = array[j];
      const isSmaller = current < min;

      comparisons++;
      record(
        { type: "compare", indices: [minIndex, j] },
        `So sánh ${current} (vị trí ${j}) với giá trị nhỏ nhất hiện tại ${min} (vị trí ${minIndex}): ` +
          (isSmaller
            ? `${current} < ${min} nên ${current} là giá trị nhỏ nhất mới`
            : `${current} ≥ ${min} nên giữ nguyên`),
      );

      if (isSmaller) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      const first = array[i];
      const min = array[minIndex];
      array[i] = min;
      array[minIndex] = first;
      swaps++;
      record(
        { type: "swap", indices: [i, minIndex] },
        `Đổi chỗ ${first} và ${min}: ${min} về vị trí ${i}, ${first} về vị trí ${minIndex}`,
      );
    }

    sortedUntil = i + 1;
    record(
      { type: "mark-sorted", indices: [i] },
      minIndex === i
        ? `${array[i]} đã là giá trị nhỏ nhất và nằm sẵn ở vị trí ${i} nên không cần đổi chỗ`
        : `${array[i]} đã nằm đúng vị trí cuối cùng ${i}`,
    );
  }

  if (array.length > 0) {
    const last = array.length - 1;
    sortedUntil = array.length;
    record(
      { type: "mark-sorted", indices: [last] },
      `${array[last]} là phần tử cuối cùng còn lại nên đã nằm đúng vị trí ${last}`,
    );
  }

  record(
    { type: "complete" },
    `Hoàn tất: mảng đã được sắp xếp tăng dần sau ${comparisons} lần so sánh và ${swaps} lần đổi chỗ`,
  );

  return {
    metadata,
    output: array,
    events,
    metrics: { comparisons, swaps, writes: swaps * 2 },
  };
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, offset) => start + offset);
}

export const selectionSort: IAlgorithmDefinition<
  SelectionSortInput,
  SelectionSortResult,
  typeof SELECTION_SORT_ID
> = Object.freeze({ metadata, execute: executeSelectionSort });
