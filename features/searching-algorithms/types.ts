/**
 * Đầu vào chung của các thuật toán tìm kiếm: tìm `target` trong `array`.
 */
export interface ISearchInput {
  readonly array: readonly number[];
  readonly target: number;
}

/**
 * Ảnh chụp đầy đủ sau mỗi bước, đã bị đóng băng. Mảng không bao giờ bị sửa nên mọi ảnh chụp của
 * một lần chạy dùng chung một bản sao.
 *
 * `low`: Vị trí đầu của vùng còn có thể chứa `target`.
 * `high`: Vị trí cuối của vùng đó, tính cả chính nó; `low > high` nghĩa là vùng đã rỗng.
 */
export interface ISearchState {
  readonly array: readonly number[];
  readonly target: number;
  readonly low: number;
  readonly high: number;
}

/**
 * Các chỉ số đo của một lần tìm kiếm.
 *
 * `comparisons`: Số lần so sánh một phần tử với `target` (bằng số sự kiện "compare").
 */
export interface ISearchMetrics {
  readonly comparisons: number;
}

/**
 * Kết quả của một lần tìm: vị trí tìm thấy `target`, hoặc -1 nếu không có trong mảng.
 */
export type SearchOutput = number;
