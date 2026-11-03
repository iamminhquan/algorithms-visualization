import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";

export type QuickSortInput = readonly number[];

export type QuickSortStep =
  | {
      readonly type: "compare";
      readonly indices: readonly [number, number];
      readonly lo: number;
      readonly hi: number;
      readonly i: number;
    }
  | {
      readonly type: "swap";
      readonly indices: readonly [number, number];
      readonly lo: number;
      readonly hi: number;
      readonly i: number;
    }
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

export interface IQuickSortState {
  readonly array: readonly number[];
  readonly sortedIndices: readonly number[];
}

export interface IQuickSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

export type QuickSortEvent = IExecutionEvent<QuickSortStep, IQuickSortState>;

export type QuickSortResult = IExecutionResult<
  readonly number[],
  QuickSortEvent,
  IQuickSortMetrics
>;
