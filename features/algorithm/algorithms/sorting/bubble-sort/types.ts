import type { IExecutionEvent, IExecutionResult } from "../../../engine";

export type BubbleSortInput = readonly number[];

/**
 * Thao tác trong một bước. Chỉ số luôn là vị trí trong mảng đang sắp xếp.
 */
export type BubbleSortStep =
  | { readonly type: "compare"; readonly indices: readonly [number, number] }
  | { readonly type: "swap"; readonly indices: readonly [number, number] }
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

/**
 * Ảnh chụp đầy đủ sau mỗi bước, là bản sao riêng và đã bị đóng băng.
 *
 * `sortedIndices`: Các vị trí đã nằm ở chỗ cuối cùng tính tới bước này, tăng dần.
 */
export interface IBubbleSortState {
  readonly array: readonly number[];
  readonly sortedIndices: readonly number[];
}

/**
 * Các chỉ số đo của một lần chạy Bubble Sort.
 *
 * `comparisons`: Số lần so sánh hai phần tử (bằng số sự kiện "compare").
 * `swaps`: Số lần thực sự đổi chỗ (bằng số sự kiện "swap").
 * `writes`: Số lần ghi vào mảng đang sắp xếp; mỗi lần đổi chỗ ghi 2 ô, nên luôn bằng 2 × swaps.
 *   Bản sao ban đầu từ input không được tính.
 */
export interface IBubbleSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

/**
 * Sự kiện dành riêng cho thuật toán Bubble Sort.
 *
 * `BubbleSortStep`: Các bước trong thuật toán.
 * `IBubbleSortState`: Trạng thái hiện tại của mảng đang được sắp xếp tới đâu.
 */
export type BubbleSortEvent = IExecutionEvent<BubbleSortStep, IBubbleSortState>;

export type BubbleSortResult = IExecutionResult<
  readonly number[],
  BubbleSortEvent,
  IBubbleSortMetrics
>;
