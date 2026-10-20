// Hợp đồng chung của engine thuật toán. File này không được biết gì về
// sắp xếp, tìm kiếm hay đồ thị: mỗi thuật toán tự định nghĩa payload sự kiện,
// trạng thái, kết quả và chỉ số đo của riêng nó rồi "cắm" vào các kiểu bên dưới.

/** Danh tính của một thuật toán, dùng để tra cứu và hiển thị danh sách. */
export interface AlgorithmMetadata<TId extends string = string> {
  /**
   * Định danh ổn định dạng "<nhóm>.<tên>", ví dụ "sorting.bubble-sort".
   */
  readonly id: TId;
  readonly name: string;
  /**
   * Nhóm thuật toán, ví dụ "sorting", "searching", "graph".
   */
  readonly category: string;
  readonly description: string;
}

/** Phần riêng của một sự kiện: thao tác gì đã xảy ra. `type` dùng để phân biệt union. */
export interface EventPayload {
  readonly type: string;
}

/**
 * Một bản ghi trong vết thực thi.
 * - `payload`: thao tác vừa xảy ra (so sánh, đổi chỗ, push, thăm đỉnh...).
 * - `state`: ảnh chụp trạng thái *sau* thao tác, đủ để vẽ lại bước này mà không cần phát lại các bước trước.
 */
export interface ExecutionEvent<TPayload extends EventPayload, TState> {
  readonly description: string;
  readonly payload: TPayload;
  readonly state: TState;
}

/**
 * Kết quả của một lần chạy: thông tin chung (thuật toán nào, các sự kiện theo thứ tự)
 * cộng phần riêng của thuật toán (`output`, `metrics`).
 */
export interface ExecutionResult<
  TOutput,
  TEvent extends ExecutionEvent<EventPayload, unknown>,
  TMetrics,
> {
  readonly metadata: AlgorithmMetadata;
  readonly output: TOutput;
  /** Theo đúng thứ tự thao tác đã xảy ra; sự kiện cuối là trạng thái kết thúc. */
  readonly events: readonly TEvent[];
  readonly metrics: TMetrics;
}

/** Một thuật toán chạy được: đồng bộ, tất định, không phụ thuộc UI hay trình duyệt. */
export interface AlgorithmDefinition<
  TInput,
  TResult extends ExecutionResult<
    unknown,
    ExecutionEvent<EventPayload, unknown>,
    unknown
  >,
  TId extends string = string,
> {
  readonly metadata: AlgorithmMetadata<TId>;
  // Khai báo dạng thuộc tính (không phải method) để TypeScript kiểm tra tham số chặt chẽ
  readonly execute: (input: TInput) => TResult;
}

/**
 * Kiểu chung cho mọi thuật toán, dùng khi chứa nhiều thuật toán khác kiểu trong cùng
 * một registry. Đầu vào là `never` nên không thể gọi `execute` nếu chưa biết thuật toán cụ thể.
 */
export type AnyAlgorithmDefinition = AlgorithmDefinition<
  never,
  ExecutionResult<unknown, ExecutionEvent<EventPayload, unknown>, unknown>
>;
