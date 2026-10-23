import type { IEventPayload, IExecutionEvent } from "@/engine/algorithm";

/**
 * Số sự kiện của từng loại thao tác, tính từ đầu vết tới một bước.
 *
 * @template TType Các loại thao tác cần đếm, ví dụ `"compare" | "swap"`.
 */
export type PayloadTypeCounts<TType extends string> = Readonly<
  Record<TType, number>
>;

/**
 * Đếm dồn số sự kiện của từng loại thao tác qua cả vết, để UI hiện bộ đếm chạy theo bước
 * (ví dụ "đã so sánh 12 lần") mà thuật toán không phải đưa bộ đếm vào ảnh chụp trạng thái.
 * Tính một lần cho cả vết nên tra cứu ở bước nào cũng tốn O(1).
 *
 * @template TEvent Kiểu sự kiện của thuật toán.
 * @template TType Các loại thao tác cần đếm, phải là `payload.type` có trong `TEvent`.
 * @param events Vết thực thi.
 * @param types Các loại thao tác cần đếm.
 * @returns Mảng cùng độ dài với `events`; phần tử thứ i là số lần mỗi loại xuất hiện
 *   trong các sự kiện từ 0 tới i, tính cả sự kiện i.
 */
export function countPayloadTypes<
  TEvent extends IExecutionEvent<IEventPayload, unknown>,
  TType extends TEvent["payload"]["type"],
>(
  events: readonly TEvent[],
  types: readonly TType[],
): readonly PayloadTypeCounts<TType>[] {
  /*
   * `Object.fromEntries` làm mất kiểu key, nhưng object này có đúng một key cho mỗi phần tử
   * của `types`, nên ép về `Record<TType, number>` là đúng.
   */
  const running = Object.fromEntries(types.map((type) => [type, 0])) as Record<
    TType,
    number
  >;
  const isCounted = (type: string): type is TType =>
    Object.hasOwn(running, type);

  return events.map((event) => {
    const { type } = event.payload;
    if (isCounted(type)) {
      running[type] += 1;
    }
    return Object.freeze({ ...running });
  });
}
