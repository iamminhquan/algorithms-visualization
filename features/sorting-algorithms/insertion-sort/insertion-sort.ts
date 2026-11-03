import type {
  IAlgorithmDefinition,
  IAlgorithmMetadata,
} from "@/engine/algorithm";
import { assertSortInput, range } from "../shared";
import type {
  InsertionSortEvent,
  InsertionSortInput,
  InsertionSortResult,
  InsertionSortStep,
} from "./types";

export const INSERTION_SORT_KEY = "insertion-sort";

export const MAX_INPUT_LENGTH = 100;

const metadata: IAlgorithmMetadata<typeof INSERTION_SORT_KEY> = Object.freeze({
  key: INSERTION_SORT_KEY,
});

function executeInsertionSort(input: InsertionSortInput): InsertionSortResult {
  assertSortInput(input, MAX_INPUT_LENGTH);

  const array = [...input];
  const events: InsertionSortEvent[] = [];
  let comparisons = 0;
  let swaps = 0;
  let sortedUntil = 0;

  const record = (payload: InsertionSortStep, description: string) => {
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

  for (let i = 0; i < array.length; i++) {
    for (let j = i; j > 0; j--) {
      const left = array[j - 1];
      const right = array[j];

      comparisons++;
      record(
        { type: "compare", indices: [j - 1, j] },
        `Đang so sánh ${left} và ${right}`,
      );

      if (left <= right) {
        break;
      }

      array[j - 1] = right;
      array[j] = left;
      swaps++;
      record(
        { type: "swap", indices: [j - 1, j] },
        `Đang hoán đổi ${left} và ${right}`,
      );
    }

    sortedUntil = i + 1;
    record(
      { type: "mark-sorted", indices: [i] },
      `Đoạn a[0..${i}] đã được sắp xếp`,
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

export const insertionSort: IAlgorithmDefinition<
  InsertionSortInput,
  InsertionSortResult,
  typeof INSERTION_SORT_KEY
> = Object.freeze({ metadata, execute: executeInsertionSort });
