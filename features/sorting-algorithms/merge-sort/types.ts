import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";

export type MergeSortInput = readonly number[];

export type MergeSortSide = "left" | "right";

interface IMergeScope {
  readonly lo: number;
  readonly mid: number;
  readonly hi: number;
  readonly i: number;
  readonly j: number;
}

export type MergeSortStep =
  | (IMergeScope & {
      readonly type: "compare";
      readonly indices: readonly [number, number];
    })
  | (IMergeScope & {
      readonly type: "write";
      readonly from: number;
      readonly to: number;
      readonly side: MergeSortSide;
    })
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

export interface IMergeSortState {
  readonly array: readonly number[];
  readonly sortedIndices: readonly number[];
}

export interface IMergeSortMetrics {
  readonly comparisons: number;
  readonly writes: number;
}

export type MergeSortEvent = IExecutionEvent<MergeSortStep, IMergeSortState>;

export type MergeSortResult = IExecutionResult<
  readonly number[],
  MergeSortEvent,
  IMergeSortMetrics
>;
