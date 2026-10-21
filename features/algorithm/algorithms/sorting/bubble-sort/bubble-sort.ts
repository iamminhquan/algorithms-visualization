import type { IAlgorithmDefinition, IAlgorithmMetadata } from "../../../engine";
import type {
  BubbleSortEvent,
  BubbleSortInput,
  BubbleSortResult,
  BubbleSortStep,
} from "./types";

export const BUBBLE_SORT_KEY = "bubble-sort";

/**
 * Mỗi sự kiện chụp lại cả mảng và có tới ~n² sự kiện, nên bộ nhớ tăng ~n³.
 */
export const MAX_INPUT_LENGTH = 100;

const metadata: IAlgorithmMetadata<typeof BUBBLE_SORT_KEY> = Object.freeze({
  key: BUBBLE_SORT_KEY,
});

function executeBubbleSort(input: BubbleSortInput): BubbleSortResult {
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
  const events: BubbleSortEvent[] = [];
  let comparisons = 0;
  let swaps = 0;
  let sortedFrom = array.length;

  /*
   * Mỗi sự kiện giữ bản sao riêng của mảng, nên các bước sau không làm đổi ảnh chụp trước đó.
   */
  const record = (payload: BubbleSortStep, description: string) => {
    events.push(
      Object.freeze({
        description,
        payload: Object.freeze(payload),
        state: Object.freeze({
          array: Object.freeze([...array]),
          sortedIndices: Object.freeze(range(sortedFrom, array.length)),
        }),
      }),
    );
  };

  let unsortedLength = array.length;
  while (unsortedLength > 1) {
    let swapped = false;

    for (let i = 0; i < unsortedLength - 1; i++) {
      const left = array[i];
      const right = array[i + 1];
      const outOfOrder = left > right;

      comparisons++;
      record(
        { type: "compare", indices: [i, i + 1] },
        `So sánh ${left} (vị trí ${i}) với ${right} (vị trí ${i + 1}): ` +
          (outOfOrder
            ? `${left} > ${right} nên cần đổi chỗ`
            : `${left} ≤ ${right} nên giữ nguyên`),
      );

      if (outOfOrder) {
        array[i] = right;
        array[i + 1] = left;
        swaps++;
        swapped = true;
        record(
          { type: "swap", indices: [i, i + 1] },
          `Đổi chỗ ${left} và ${right}: ${right} về vị trí ${i}, ${left} về vị trí ${i + 1}`,
        );
      }
    }

    if (!swapped) {
      break;
    }

    unsortedLength--;
    sortedFrom = unsortedLength;
    record(
      { type: "mark-sorted", indices: [unsortedLength] },
      `${array[unsortedLength]} đã nằm đúng vị trí cuối cùng ${unsortedLength}`,
    );
  }

  if (unsortedLength > 0) {
    const remaining = range(0, unsortedLength);
    sortedFrom = 0;
    record(
      { type: "mark-sorted", indices: remaining },
      unsortedLength === 1
        ? `${array[0]} là phần tử cuối cùng còn lại nên đã nằm đúng vị trí 0`
        : `Lượt vừa rồi không có lần đổi chỗ nào nên các vị trí 0–${unsortedLength - 1} đều đã đúng thứ tự`,
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

export const bubbleSort: IAlgorithmDefinition<
  BubbleSortInput,
  BubbleSortResult,
  typeof BUBBLE_SORT_KEY
> = Object.freeze({ metadata, execute: executeBubbleSort });
