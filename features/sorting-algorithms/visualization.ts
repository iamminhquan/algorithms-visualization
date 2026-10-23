import type { VisualTone } from "@/engine/visualization";
import type { BubbleSortEvent } from "./bubble-sort";
import type { SelectionSortEvent } from "./selection-sort";

/**
 * Sự kiện của mọi thuật toán sắp xếp. Các thuật toán dùng chung dạng bước (`compare`, `swap`,
 * `mark-sorted`, `complete`) và dạng ảnh chụp (`array`, `sortedIndices`), nên một trình mô phỏng
 * vẽ được tất cả.
 */
export type SortingEvent = BubbleSortEvent | SelectionSortEvent;

/**
 * Vai trò của từng cột ở một bước: cột đã đúng vị trí tô `sorted`, rồi các cột thao tác của bước
 * này (`compare`, `swap`) được tô đè lên.
 *
 * @param event Sự kiện đang xem.
 * @returns Tone của từng vị trí trong `event.state.array`.
 */
export function getBarTones(event: SortingEvent): readonly VisualTone[] {
  const tones: VisualTone[] = event.state.array.map(() => "default");
  for (const index of event.state.sortedIndices) {
    tones[index] = "sorted";
  }

  const { payload } = event;
  switch (payload.type) {
    case "compare":
    case "swap":
      for (const index of payload.indices) {
        tones[index] = payload.type;
      }
      break;
    case "mark-sorted":
    case "complete":
      break;
    default: {
      const unreachable: never = payload;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
  return tones;
}

/**
 * Ảnh chụp chỉ có giá trị, không cho biết cột nào là phần tử nào khi có giá trị trùng nhau.
 * Hàm này gán cho mỗi phần tử của input một định danh (chính là vị trí ban đầu của nó) rồi
 * áp lần lượt các bước `swap`, để cột giữ đúng định danh khi bị đổi chỗ.
 *
 * @param length Số phần tử của input.
 * @param events Vết thực thi của input đó.
 * @returns Mảng cùng độ dài với `events`; phần tử thứ i cho biết vị trí k đang chứa phần tử
 *   ban đầu ở vị trí nào, sau sự kiện i.
 */
export function trackElementIds(
  length: number,
  events: readonly SortingEvent[],
): readonly (readonly number[])[] {
  const ids = Array.from({ length }, (_, index) => index);
  return events.map((event) => {
    if (event.payload.type === "swap") {
      const [i, j] = event.payload.indices;
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return Object.freeze([...ids]);
  });
}
