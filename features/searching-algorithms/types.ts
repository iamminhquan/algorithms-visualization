export interface ISearchInput {
  readonly array: readonly number[];
  readonly target: number;
}

export interface ISearchState {
  readonly array: readonly number[];
  readonly target: number;
  readonly low: number;
  readonly high: number;
}

export interface ISearchMetrics {
  readonly comparisons: number;
}

export type SearchOutput = number;
