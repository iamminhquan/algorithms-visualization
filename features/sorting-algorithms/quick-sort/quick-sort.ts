import type {
  IAlgorithmDefinition,
  IAlgorithmMetadata,
} from "@/engine/algorithm";
import { assertSortInput } from "../shared";
import type {
  QuickSortEvent,
  QuickSortInput,
  QuickSortResult,
  QuickSortStep,
} from "./types";

export const QUICK_SORT_KEY = "quick-sort";

export const MAX_INPUT_LENGTH = 100;

const metadata: IAlgorithmMetadata<typeof QUICK_SORT_KEY> = Object.freeze({
  key: QUICK_SORT_KEY,
});

function executeQuickSort(input: QuickSortInput): QuickSortResult {
  assertSortInput(input, MAX_INPUT_LENGTH);

  const array = [...input];
  const isSorted = array.map(() => false);
  const events: QuickSortEvent[] = [];
  let comparisons = 0;
  let swaps = 0;

  const record = (payload: QuickSortStep, description: string) => {
    events.push(
      Object.freeze({
        description,
        payload: Object.freeze(payload),
        state: Object.freeze({
          array: Object.freeze([...array]),
          sortedIndices: Object.freeze(
            isSorted.flatMap((sorted, index) => (sorted ? [index] : [])),
          ),
        }),
      }),
    );
  };

  const swap = (
    lo: number,
    hi: number,
    i: number,
    left: number,
    right: number,
  ) => {
    const leftValue = array[left];
    const rightValue = array[right];
    array[left] = rightValue;
    array[right] = leftValue;
    swaps++;
    record(
      { type: "swap", indices: [left, right], lo, hi, i },
      right === hi
        ? `Đã hoán đổi ${leftValue} và ${rightValue} để đưa pivot ${rightValue} về đúng vị trí`
        : `Đã hoán đổi ${leftValue} và ${rightValue} để đưa ${rightValue} vào vùng nhỏ hơn hoặc bằng pivot`,
    );
  };

  const sortRange = (lo: number, hi: number) => {
    if (lo > hi) {
      return;
    }

    const pivot = array[hi];
    let i = lo - 1;

    for (let j = lo; j < hi; j++) {
      const current = array[j];
      const relation = current < pivot ? "<" : current > pivot ? ">" : "=";
      comparisons++;
      record(
        { type: "compare", indices: [j, hi], lo, hi, i },
        `Đang so sánh a[${j}] = ${current} với pivot = ${pivot}: vì ${current} ${relation} ${pivot} nên ${
          current <= pivot
            ? `giữ ${current} trong vùng nhỏ hơn hoặc bằng pivot`
            : `giữ ${current} ở vùng lớn hơn pivot`
        }`,
      );

      if (current <= pivot) {
        i++;
        if (i !== j) {
          swap(lo, hi, i, i, j);
        }
      }
    }

    const pivotIndex = i + 1;
    if (pivotIndex !== hi) {
      swap(lo, hi, i, pivotIndex, hi);
    }

    isSorted[pivotIndex] = true;
    record(
      { type: "mark-sorted", indices: [pivotIndex] },
      `Pivot ${pivot} đã vào đúng vị trí ${pivotIndex} vì mọi phần tử bên trái đều nhỏ hơn hoặc bằng ${pivot}`,
    );

    sortRange(lo, pivotIndex - 1);
    sortRange(pivotIndex + 1, hi);
  };

  sortRange(0, array.length - 1);

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

export const quickSort: IAlgorithmDefinition<
  QuickSortInput,
  QuickSortResult,
  typeof QUICK_SORT_KEY
> = Object.freeze({ metadata, execute: executeQuickSort });
