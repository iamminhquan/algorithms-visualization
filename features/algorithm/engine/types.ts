export type BarState = "default" | "comparing" | "swapping" | "sorted";
export type StepAction = "init" | "compare" | "swap" | "mark-sorted" | "done";

export interface Step {
  readonly index: number;
  readonly action: StepAction;
  readonly array: readonly number[];
  readonly states: readonly BarState[];
  readonly indices: readonly number[];
  readonly message: string;
  readonly comparisons: number;
  readonly swaps: number;
}

export interface TrackedArray {
  readonly length: number;
  get(index: number): number;
  compare(i: number, j: number, message?: string): number; // a[i] - a[j]
  swap(i: number, j: number, message?: string): void;
  markSorted(index: number, message?: string): void;
}

export interface SortingAlgorithm {
  readonly slug: string;
  readonly name: string;
  sort(array: TrackedArray): void;
}

export interface StepHistory {
  readonly slug: string;
  readonly input: readonly number[];
  readonly steps: readonly Step[];
}
