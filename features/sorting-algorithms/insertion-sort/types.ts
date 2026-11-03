import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";

export type InsertionSortInput = readonly number[];

export type InsertionSortStep =
  | { readonly type: "compare"; readonly indices: readonly [number, number] }
  | { readonly type: "swap"; readonly indices: readonly [number, number] }
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

export interface IInsertionSortState {
  readonly array: readonly number[];
  readonly sortedIndices: readonly number[];
}

export interface IInsertionSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

export type InsertionSortEvent = IExecutionEvent<
  InsertionSortStep,
  IInsertionSortState
>;

export type InsertionSortResult = IExecutionResult<
  readonly number[],
  InsertionSortEvent,
  IInsertionSortMetrics
>;
