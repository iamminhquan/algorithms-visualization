import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";
import type {
  ISearchInput,
  ISearchMetrics,
  ISearchState,
  SearchOutput,
} from "../types";

export type LinearSearchInput = ISearchInput;

export type LinearSearchStep =
  | { readonly type: "compare"; readonly index: number }
  | { readonly type: "found"; readonly index: number }
  | { readonly type: "not-found" };

/**
 * Sự kiện dành riêng cho thuật toán Linear Search. Vùng tìm kiếm luôn kết thúc ở cuối mảng,
 * còn `low` là phần tử đầu tiên chưa xét.
 */
export type LinearSearchEvent = IExecutionEvent<LinearSearchStep, ISearchState>;

export type LinearSearchResult = IExecutionResult<
  SearchOutput,
  LinearSearchEvent,
  ISearchMetrics
>;
