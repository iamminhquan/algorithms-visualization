import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";

export type BubbleSortInput = readonly number[];

export type BubbleSortStep =
  | { readonly type: "compare"; readonly indices: readonly [number, number] }
  | { readonly type: "swap"; readonly indices: readonly [number, number] }
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

export interface IBubbleSortState {
  readonly array: readonly number[];
  readonly sortedIndices: readonly number[];
}
export interface IBubbleSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

export type BubbleSortEvent = IExecutionEvent<BubbleSortStep, IBubbleSortState>;

export type BubbleSortResult = IExecutionResult<
  readonly number[],
  BubbleSortEvent,
  IBubbleSortMetrics
>;
