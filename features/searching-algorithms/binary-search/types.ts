import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";
import type {
  ISearchInput,
  ISearchMetrics,
  ISearchState,
  SearchOutput,
} from "../types";

export type BinarySearchInput = ISearchInput;

export type BinarySearchStep =
  | { readonly type: "init" }
  | { readonly type: "pick-mid"; readonly mid: number }
  | { readonly type: "compare"; readonly mid: number }
  | {
      readonly type: "narrow";
      readonly mid: number;
      readonly keep: "left" | "right";
    }
  | { readonly type: "found"; readonly index: number }
  | { readonly type: "not-found" };

export type BinarySearchEvent = IExecutionEvent<BinarySearchStep, ISearchState>;

export type BinarySearchResult = IExecutionResult<
  SearchOutput,
  BinarySearchEvent,
  ISearchMetrics
>;
