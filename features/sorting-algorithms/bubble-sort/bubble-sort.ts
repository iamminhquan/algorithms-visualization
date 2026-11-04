import type {
  IAlgorithmDefinition,
  IAlgorithmMetadata,
} from "@/engine/algorithm";
import { assertSortInput, range } from "../shared";
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
  assertSortInput(input, MAX_INPUT_LENGTH);

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
  for (let i = unsortedLength; i >= 0; i--) {
    let swapped = false;

    for (let j = 0; j < i - 1; j++) {
      const left = array[j];
      const right = array[j + 1];
      const outOfOrder = left > right;
      const relation = left === right ? "=" : left > right ? ">" : "<";

      comparisons++;
      record(
        { type: "compare", indices: [j, j + 1] },
        `Đang so sánh a[${j}] = ${left} với a[${j + 1}] = ${right}: vì ${left} ${relation} ${right} nên ${outOfOrder ? "hoán đổi" : "không hoán đổi"}`,
      );

      if (outOfOrder) {
        array[j] = right;
        array[j + 1] = left;
        swaps++;
        swapped = true;
        record(
          { type: "swap", indices: [j, j + 1] },
          `Đã hoán đổi ${left} và ${right}`,
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
      `Đã chốt ${array[unsortedLength]} vào đúng vị trí ${unsortedLength} vì ${array[unsortedLength]} là lớn nhất trong đoạn còn lại`,
    );
  }

  if (unsortedLength > 0) {
    const remaining = range(0, unsortedLength);
    sortedFrom = 0;
    record(
      { type: "mark-sorted", indices: remaining },
      unsortedLength === 1
        ? `${array[0]} đã vào đúng vị trí vì chỉ còn một phần tử`
        : "Các phần tử còn lại đã đúng thứ tự vì không còn cặp nào sai thứ tự",
    );
  }

  record(
    { type: "complete" },
    `Hoàn tất: ${comparisons} lần so sánh, ${swaps} lần hoán đổi`,
  );

  return {
    metadata,
    output: array,
    events,
    metrics: { comparisons, swaps, writes: swaps * 2 },
  };
}

export const bubbleSort: IAlgorithmDefinition<
  BubbleSortInput,
  BubbleSortResult,
  typeof BUBBLE_SORT_KEY
> = Object.freeze({ metadata, execute: executeBubbleSort });
