import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";
import type {
  ISearchInput,
  ISearchMetrics,
  ISearchState,
  SearchOutput,
} from "../types";

export type LinearSearchInput = ISearchInput;
export type LinearSearchEvent = IExecutionEvent<LinearSearchStep, ISearchState>;

export type LinearSearchStep =
  | { readonly type: "compare"; readonly index: number }
  | { readonly type: "found"; readonly index: number }
  | { readonly type: "not-found" };

export type LinearSearchResult = IExecutionResult<
  SearchOutput,
  LinearSearchEvent,
  ISearchMetrics
>;
