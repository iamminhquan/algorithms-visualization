import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";
import type {
  ISearchInput,
  ISearchMetrics,
  ISearchState,
  SearchOutput,
} from "../types";

/**
 * Đầu vào của Binary Search; `array` phải tăng dần (cho phép giá trị bằng nhau).
 */
export type BinarySearchInput = ISearchInput;

/**
 * Thao tác trong một bước. `found` và `not-found` là bước cuối của vết.
 *
 * `init`: Đặt vùng tìm kiếm là cả mảng.
 * `pick-mid`: Chọn phần tử giữa vùng `[low, high]`.
 * `compare`: So sánh `a[mid]` với `target`.
 * `narrow`: Bỏ nửa không thể chứa `target`; `keep` là nửa được giữ lại so với `mid`, ảnh chụp
 *   của bước này đã có `low` hoặc `high` mới.
 */
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
