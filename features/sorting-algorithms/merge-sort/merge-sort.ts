import type {
  IAlgorithmDefinition,
  IAlgorithmMetadata,
} from "@/engine/algorithm";
import { assertSortInput, range } from "../shared";
import type {
  MergeSortEvent,
  MergeSortInput,
  MergeSortResult,
  MergeSortSide,
  MergeSortStep,
} from "./types";

export const MERGE_SORT_KEY = "merge-sort";

export const MAX_INPUT_LENGTH = 100;

const metadata: IAlgorithmMetadata<typeof MERGE_SORT_KEY> = Object.freeze({
  key: MERGE_SORT_KEY,
});

function executeMergeSort(input: MergeSortInput): MergeSortResult {
  assertSortInput(input, MAX_INPUT_LENGTH);

  const array = [...input];
  const events: MergeSortEvent[] = [];
  let comparisons = 0;
  let writes = 0;
  let isDone = false;

  const record = (payload: MergeSortStep, description: string) => {
    events.push(
      Object.freeze({
        description,
        payload: Object.freeze(payload),
        state: Object.freeze({
          array: Object.freeze([...array]),
          sortedIndices: Object.freeze(isDone ? range(0, array.length) : []),
        }),
      }),
    );
  };

  const merge = (lo: number, mid: number, hi: number) => {
    const leftLength = mid - lo + 1;
    const rightLength = hi - mid;
    let i = 0;
    let j = 0;

    for (let k = lo; k <= hi; k++) {
      const leftPosition = k;
      const rightPosition = mid + 1 + j;
      const scope = { lo, mid, hi, i, j };
      let side: MergeSortSide = i < leftLength ? "left" : "right";
      let compared = false;

      if (i < leftLength && j < rightLength) {
        const left = array[leftPosition];
        const right = array[rightPosition];
        const takeLeft = left <= right;
        const relation = left < right ? "<" : left > right ? ">" : "=";
        const chosenSide = takeLeft ? "left" : "right";
        const chosenIndex = takeLeft ? i : j;
        const chosenValue = takeLeft ? left : right;
        comparisons++;
        record(
          {
            type: "compare",
            indices: [leftPosition, rightPosition],
            ...scope,
          },
          `Đang so sánh left[${i}] = ${left} với right[${j}] = ${right}: vì ${left} ${relation} ${right} nên lấy ${chosenSide}[${chosenIndex}] là ${chosenValue} để ghi vào a[${k}]`,
        );
        side = chosenSide;
        compared = true;
      }

      const from = side === "left" ? leftPosition : rightPosition;
      const [value] = array.splice(from, 1);
      array.splice(k, 0, value);
      writes++;
      record(
        { type: "write", from, to: k, side, ...scope },
        compared
          ? `Đã ghi ${value} vào a[${k}]`
          : `Đã ghi ${value} vào a[${k}] vì nửa ${i >= leftLength ? "trái" : "phải"} đã hết`,
      );

      if (side === "left") {
        i++;
      } else {
        j++;
      }
    }
  };

  const sortRange = (lo: number, hi: number) => {
    if (lo >= hi) {
      return;
    }

    const mid = Math.floor((lo + hi) / 2);
    sortRange(lo, mid);
    sortRange(mid + 1, hi);
    merge(lo, mid, hi);
  };

  sortRange(0, array.length - 1);

  if (array.length > 0) {
    isDone = true;
    record(
      { type: "mark-sorted", indices: range(0, array.length) },
      "Toàn bộ mảng đã được sắp xếp vì mọi đoạn đã được trộn",
    );
  }

  record(
    { type: "complete" },
    `Hoàn tất: ${comparisons} lần so sánh, ${writes} lần ghi vào mảng`,
  );

  return { metadata, output: array, events, metrics: { comparisons, writes } };
}

export const mergeSort: IAlgorithmDefinition<
  MergeSortInput,
  MergeSortResult,
  typeof MERGE_SORT_KEY
> = Object.freeze({ metadata, execute: executeMergeSort });
