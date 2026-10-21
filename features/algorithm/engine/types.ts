/*
 * Hợp đồng chung của engine thuật toán. File này không được biết gì về
 * sắp xếp, tìm kiếm hay đồ thị: mỗi thuật toán tự định nghĩa payload sự kiện,
 * trạng thái, kết quả và chỉ số đo của riêng nó rồi "cắm" vào các kiểu bên dưới.
 */

/**
 * Danh tính của một thuật toán, dùng để tra cứu và hiển thị danh sách.
 *
 * @template TId Kiểu literal của `id`, ví dụ `"sorting.bubble-sort"`; nhờ đó registry biết
 *   chính xác id nào ứng với thuật toán nào. Mặc định là `string` khi không cần phân biệt.
 */
export interface IAlgorithmMetadata<TId extends string = string> {
  /** Định danh ổn định dạng "<nhóm>.<tên>", ví dụ "sorting.bubble-sort". Không đổi giữa các lần chạy. */
  readonly id: TId;
  /** Tên hiển thị cho người dùng, ví dụ "Sắp xếp nổi bọt (Bubble Sort)". */
  readonly name: string;
  /** Nhóm thuật toán, ví dụ "sorting", "searching", "graph". */
  readonly category: string;
  /** Mô tả ngắn cách thuật toán hoạt động, hiển thị trong danh sách hoặc trang chi tiết. */
  readonly description: string;
}

/**
 * Phần riêng của một sự kiện: thao tác gì đã xảy ra (so sánh, đổi chỗ, push, thăm đỉnh...).
 * Mỗi thuật toán mở rộng thành một union riêng, phân biệt bằng `type`.
 */
export interface IEventPayload {
  /** Tên loại thao tác, dùng để phân biệt các trường hợp trong union, ví dụ "compare", "swap". */
  readonly type: string;
}

/**
 * Một bản ghi trong vết thực thi.
 *
 * @template TPayload Union các thao tác của thuật toán, ví dụ `BubbleSortStep`.
 * @template TState Hình dạng ảnh chụp trạng thái của thuật toán, ví dụ `IBubbleSortState`.
 */
export interface IExecutionEvent<TPayload extends IEventPayload, TState> {
  /** Câu giải thích bước này bằng tiếng Việt, hiển thị cho người xem. */
  readonly description: string;
  /** Thao tác vừa xảy ra (so sánh, đổi chỗ, push, thăm đỉnh...), dùng để tô sáng trên hình vẽ. */
  readonly payload: TPayload;
  /**
   * Ảnh chụp trạng thái *sau* thao tác, đủ để vẽ lại bước này mà không cần phát lại
   * các bước trước.
   */
  readonly state: TState;
}

/**
 * Kết quả của một lần chạy: thông tin chung (thuật toán nào, các sự kiện theo thứ tự)
 * cộng phần riêng của thuật toán (`output`, `metrics`).
 *
 * @template TOutput Kiểu kết quả cuối cùng, ví dụ `readonly number[]` cho thuật toán sắp xếp.
 * @template TEvent Kiểu sự kiện của thuật toán, ví dụ `BubbleSortEvent`.
 * @template TMetrics Kiểu các chỉ số đo, ví dụ `IBubbleSortMetrics` (số lần so sánh, đổi chỗ...).
 */
export interface IExecutionResult<
  TOutput,
  TEvent extends IExecutionEvent<IEventPayload, unknown>,
  TMetrics,
> {
  /** Metadata của thuật toán đã tạo ra kết quả này. */
  readonly metadata: IAlgorithmMetadata;
  /** Kết quả cuối cùng của thuật toán, ví dụ mảng đã sắp xếp. */
  readonly output: TOutput;
  /** Vết thực thi theo đúng thứ tự thao tác đã xảy ra; sự kiện cuối là trạng thái kết thúc. */
  readonly events: readonly TEvent[];
  /** Các chỉ số đo của cả lần chạy, ví dụ số lần so sánh và đổi chỗ. */
  readonly metrics: TMetrics;
}

/**
 * Một thuật toán chạy được: đồng bộ, tất định, không phụ thuộc UI hay trình duyệt.
 *
 * @template TInput Kiểu dữ liệu đầu vào, ví dụ `readonly number[]`.
 * @template TResult Kiểu kết quả `execute` trả về, ví dụ `BubbleSortResult`.
 * @template TId Kiểu literal của id thuật toán, ví dụ `"sorting.bubble-sort"`.
 */
export interface IAlgorithmDefinition<
  TInput,
  TResult extends IExecutionResult<
    unknown,
    IExecutionEvent<IEventPayload, unknown>,
    unknown
  >,
  TId extends string = string,
> {
  /** Danh tính của thuật toán, dùng để đăng ký và tra cứu trong registry. */
  readonly metadata: IAlgorithmMetadata<TId>;
  /**
   * Chạy thuật toán trên `input` và trả về kết quả kèm toàn bộ vết thực thi.
   * Khai báo dạng thuộc tính (không phải method) để TypeScript kiểm tra tham số chặt chẽ.
   *
   * @param input Dữ liệu đầu vào; không bị sửa.
   * @returns Kết quả, vết thực thi và chỉ số đo của lần chạy.
   */
  readonly execute: (input: TInput) => TResult;
}

/**
 * Kiểu chung cho mọi thuật toán, dùng khi chứa nhiều thuật toán khác kiểu trong cùng
 * một registry. Đầu vào là `never` nên không thể gọi `execute` nếu chưa biết thuật toán cụ thể.
 */
export type AnyAlgorithmDefinition = IAlgorithmDefinition<
  never,
  IExecutionResult<unknown, IExecutionEvent<IEventPayload, unknown>, unknown>
>;
