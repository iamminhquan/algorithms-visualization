import type { IEventPayload } from "@/engine/algorithm";

/**
 * Mã giả của một thuật toán cùng cách tìm dòng ứng với mỗi bước, để UI tô sáng dòng đang chạy.
 *
 * @template TStep Union các thao tác của thuật toán, ví dụ `BubbleSortStep`.
 *
 * `lines`: Các dòng mã giả theo thứ tự; mỗi cấp thụt lề là hai dấu cách ở đầu dòng.
 *   Các dòng không được trùng nhau vì UI dùng nội dung dòng làm key.
 * `getActiveLine`: Chỉ số trong `lines` của dòng vừa tạo ra bước này, hoặc `undefined`
 *   nếu bước không ứng với dòng nào.
 */
export interface IPseudocode<TStep extends IEventPayload> {
  readonly lines: readonly string[];
  readonly getActiveLine: (step: TStep) => number | undefined;
}
