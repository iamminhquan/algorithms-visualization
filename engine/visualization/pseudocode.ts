import type { IEventPayload } from "@/engine/algorithm";

/**
 * Mã giả của một thuật toán cùng cách tìm dòng ứng với mỗi bước, để UI tô sáng dòng đang chạy.
 *
 * @template TStep Union các thao tác của thuật toán, ví dụ `BubbleSortStep`.
 *
 * `lines`: Các dòng mã giả theo thứ tự; mỗi cấp thụt lề là hai dấu cách ở đầu dòng.
 *   Viết bằng tiếng Anh, ngắn gọn kiểu Python nhưng không phải Python: thụt lề thay cho ngoặc,
 *   không `def`/`range`/`len`, mỗi dòng một thao tác (ví dụ `for i from 0 to n - 2`,
 *   `if a[j] < a[min]: min = j`, `swap a[i], a[j]`), gán bằng `=`, kết thúc bằng `done`.
 *   Các dòng không được trùng nhau vì UI dùng nội dung dòng làm key.
 * `getActiveLine`: Chỉ số trong `lines` của dòng vừa tạo ra bước này, hoặc `undefined`
 *   nếu bước không ứng với dòng nào.
 */
export interface IPseudocode<TStep extends IEventPayload> {
  readonly lines: readonly string[];
  readonly getActiveLine: (step: TStep) => number | undefined;
}
