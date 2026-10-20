import type { ExecutionEvent, ExecutionResult } from "../../../engine";

export type BubbleSortInput = readonly number[];

/** Thao tác trong một bước. Chỉ số luôn là vị trí trong mảng đang sắp xếp. */
export type BubbleSortStep =
  | { readonly type: "compare"; readonly indices: readonly [number, number] }
  | { readonly type: "swap"; readonly indices: readonly [number, number] }
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

/** Ảnh chụp đầy đủ sau mỗi bước, là bản sao riêng và đã bị đóng băng. */
export interface BubbleSortState {
  readonly array: readonly number[];
  /** Các vị trí đã nằm ở chỗ cuối cùng tính tới bước này, tăng dần. */
  readonly sortedIndices: readonly number[];
}

/**
 * - `comparisons`: số lần so sánh hai phần tử (bằng số sự kiện "compare").
 * - `swaps`: số lần thực sự đổi chỗ (bằng số sự kiện "swap").
 * - `writes`: số lần ghi vào mảng đang sắp xếp; mỗi lần đổi chỗ ghi 2 ô, nên luôn bằng 2 × swaps.
 *   Bản sao ban đầu từ input không được tính.
 */
export interface BubbleSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

export type BubbleSortEvent = ExecutionEvent<BubbleSortStep, BubbleSortState>;

export type BubbleSortResult = ExecutionResult<
  readonly number[],
  BubbleSortEvent,
  BubbleSortMetrics
>;
