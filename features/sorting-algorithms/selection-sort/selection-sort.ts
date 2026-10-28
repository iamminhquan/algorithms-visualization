import type {
  IAlgorithmDefinition,
  IAlgorithmMetadata,
} from "@/engine/algorithm";
import { assertSortInput, range } from "../shared";
import type {
  SelectionSortEvent,
  SelectionSortInput,
  SelectionSortResult,
  SelectionSortStep,
} from "./types";

export const SELECTION_SORT_KEY = "selection-sort";

/**
 * Mỗi sự kiện chụp lại cả mảng và có tới ~n²/2 sự kiện, nên bộ nhớ tăng ~n³.
 */
export const MAX_INPUT_LENGTH = 100;

const metadata: IAlgorithmMetadata<typeof SELECTION_SORT_KEY> = Object.freeze({
  key: SELECTION_SORT_KEY,
});

function executeSelectionSort(input: SelectionSortInput): SelectionSortResult {
  assertSortInput(input, MAX_INPUT_LENGTH);

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
        `Đang so sánh ${min} và ${current}`,
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
        `Đang hoán đổi ${first} và ${min}`,
      );
    }

    sortedUntil = i + 1;
    record(
      { type: "mark-sorted", indices: [i] },
      `${array[i]} đã vào đúng vị trí`,
    );
  }

  if (array.length > 0) {
    const last = array.length - 1;
    sortedUntil = array.length;
    record(
      { type: "mark-sorted", indices: [last] },
      `${array[last]} đã vào đúng vị trí`,
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

export const selectionSort: IAlgorithmDefinition<
  SelectionSortInput,
  SelectionSortResult,
  typeof SELECTION_SORT_KEY
> = Object.freeze({ metadata, execute: executeSelectionSort });
