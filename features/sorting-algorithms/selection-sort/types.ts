import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";

export type SelectionSortInput = readonly number[];

export type SelectionSortStep =
  | { readonly type: "compare"; readonly indices: readonly [number, number] }
  | { readonly type: "swap"; readonly indices: readonly [number, number] }
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

export interface ISelectionSortState {
  readonly array: readonly number[];
  readonly sortedIndices: readonly number[];
}

export interface ISelectionSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

export type SelectionSortEvent = IExecutionEvent<
  SelectionSortStep,
  ISelectionSortState
>;

export type SelectionSortResult = IExecutionResult<
  readonly number[],
  SelectionSortEvent,
  ISelectionSortMetrics
>;
