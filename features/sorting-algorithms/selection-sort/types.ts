import type { IExecutionEvent, IExecutionResult } from "@/engine/algorithm";

export type SelectionSortInput = readonly number[];

/**
 * Thao tác trong một bước. Chỉ số luôn là vị trí trong mảng đang sắp xếp.
 *
 * `compare`: `indices[0]` là vị trí giá trị nhỏ nhất hiện tại, `indices[1]` là vị trí đang xét.
 * `swap`: Đưa giá trị nhỏ nhất (`indices[1]`) về đầu đoạn chưa sắp xếp (`indices[0]`).
 */
export type SelectionSortStep =
  | { readonly type: "compare"; readonly indices: readonly [number, number] }
  | { readonly type: "swap"; readonly indices: readonly [number, number] }
  | { readonly type: "mark-sorted"; readonly indices: readonly number[] }
  | { readonly type: "complete" };

/**
 * Ảnh chụp đầy đủ sau mỗi bước, là bản sao riêng và đã bị đóng băng.
 *
 * `sortedIndices`: Các vị trí đã nằm ở chỗ cuối cùng tính tới bước này, tăng dần.
 */
export interface ISelectionSortState {
  readonly array: readonly number[];
  readonly sortedIndices: readonly number[];
}

/**
 * Các chỉ số đo của một lần chạy Selection Sort.
 *
 * `comparisons`: Số lần so sánh hai phần tử (bằng số sự kiện "compare").
 * `swaps`: Số lần thực sự đổi chỗ (bằng số sự kiện "swap"); bỏ qua khi giá trị nhỏ nhất đã đứng đúng chỗ.
 * `writes`: Số lần ghi vào mảng đang sắp xếp; mỗi lần đổi chỗ ghi 2 ô, nên luôn bằng 2 × swaps.
 *   Bản sao ban đầu từ input không được tính.
 */
export interface ISelectionSortMetrics {
  readonly comparisons: number;
  readonly swaps: number;
  readonly writes: number;
}

/**
 * Sự kiện dành riêng cho thuật toán Selection Sort.
 *
 * `SelectionSortStep`: Các bước trong thuật toán.
 * `ISelectionSortState`: Trạng thái hiện tại của mảng đang được sắp xếp tới đâu.
 */
export type SelectionSortEvent = IExecutionEvent<
  SelectionSortStep,
  ISelectionSortState
>;

export type SelectionSortResult = IExecutionResult<
  readonly number[],
  SelectionSortEvent,
  ISelectionSortMetrics
>;
