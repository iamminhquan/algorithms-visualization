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

  const sortRange = (lo: number, hi: number) => {
    if (lo > hi) {
      return;
    }

    if (lo === hi) {
      isSorted[lo] = true;
      record(
        { type: "mark-sorted", indices: [lo] },
        `Phần tử ${array[lo]} đã ở đúng vị trí ${lo}`,
      );
      return;
    }

    const mid = lo + Math.floor((hi - lo) / 2);
    const pivot = array[mid];
    let i = lo;
    let j = hi;

    do {
      while (i <= hi) {
        comparisons++;
        record(
          {
            type: "compare",
            indices: [i],
            lo,
            hi,
            i,
            j,
            pivot,
            mid,
            side: "i",
          },
          `Đang so sánh a[${i}] = ${array[i]} với pivot = ${pivot}: ${
            array[i] < pivot ? "tăng i" : "dừng i"
          }`,
        );
        if (array[i] < pivot) {
          i++;
        } else {
          break;
        }
      }

      while (j >= lo) {
        comparisons++;
        record(
          {
            type: "compare",
            indices: [j],
            lo,
            hi,
            i,
            j,
            pivot,
            mid,
            side: "j",
          },
          `Đang so sánh a[${j}] = ${array[j]} với pivot = ${pivot}: ${
            array[j] > pivot ? "giảm j" : "dừng j"
          }`,
        );
        if (array[j] > pivot) {
          j--;
        } else {
          break;
        }
      }

      comparisons++;
      record(
        {
          type: "compare",
          indices: [i, j],
          lo,
          hi,
          i,
          j,
          pivot,
          mid,
          side: "ij",
        },
        `Đang kiểm tra i <= j: ${i} ${i <= j ? "<=" : ">"} ${j}`,
      );

      if (i <= j) {
        if (array[i] !== array[j]) {
          const leftValue = array[i];
          const rightValue = array[j];
          array[i] = rightValue;
          array[j] = leftValue;
          swaps++;
          record(
            {
              type: "swap",
              indices: [i, j],
              lo,
              hi,
              i,
              j,
              pivot,
              mid,
            },
            `Đã hoán đổi ${leftValue} và ${rightValue}`,
          );
        }
        i++;
        j--;
      }
    } while (i <= j);

    comparisons++;
    record(
      {
        type: "compare",
        indices: [lo, j],
        lo,
        hi,
        i,
        j,
        pivot,
        mid,
        side: "left-j",
      },
      `Đang kiểm tra left < j: ${lo} ${lo < j ? "<" : ">="} ${j}`,
    );
    if (lo < j) {
      record(
        {
          type: "recurse",
          side: "left",
          lo,
          hi,
          i,
          j,
          pivot,
          mid,
        },
        `Gọi đệ quy quick_sort(${lo}, ${j})`,
      );
      sortRange(lo, j);
    }

    comparisons++;
    record(
      {
        type: "compare",
        indices: [i, hi],
        lo,
        hi,
        i,
        j,
        pivot,
        mid,
        side: "i-right",
      },
      `Đang kiểm tra i < right: ${i} ${i < hi ? "<" : ">="} ${hi}`,
    );
    if (i < hi) {
      record(
        {
          type: "recurse",
          side: "right",
          lo,
          hi,
          i,
          j,
          pivot,
          mid,
        },
        `Gọi đệ quy quick_sort(${i}, ${hi})`,
      );
      sortRange(i, hi);
    }
  };

  sortRange(0, array.length - 1);

  for (let index = 0; index < array.length; index++) {
    isSorted[index] = true;
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

export const quickSort: IAlgorithmDefinition<
  QuickSortInput,
  QuickSortResult,
  typeof QUICK_SORT_KEY
> = Object.freeze({ metadata, execute: executeQuickSort });
