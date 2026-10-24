import type {
  IBarBracket,
  IBarMarker,
  IBarRange,
} from "@/components/visualization/array-bars";
import type { VisualTone } from "@/engine/visualization";
import type { BinarySearchEvent } from "./binary-search";
import type { LinearSearchEvent } from "./linear-search";
import type { ISearchState } from "./types";

/**
 * Sự kiện của mọi thuật toán tìm kiếm; các thuật toán có bước riêng nhưng dùng chung dạng
 * ảnh chụp `ISearchState`.
 */
export type SearchingEvent = LinearSearchEvent | BinarySearchEvent;

/**
 * Mọi thứ cần vẽ trên mảng ở một bước.
 *
 * `tones`: Tone của từng vị trí.
 * `markers`: Huy hiệu của từng vị trí, cùng độ dài với `tones`; từ đỉnh cột đi lên.
 * `bracket`: Ngoặc phủ phần tử đang so sánh, không có ở bước không so sánh.
 * `range`: Khung bao vùng còn đang tìm; không có khi vùng đã rỗng hoặc thuật toán không vẽ vùng.
 */
export interface ISearchingFrame {
  readonly tones: readonly VisualTone[];
  readonly markers: readonly (readonly IBarMarker[])[];
  readonly bracket?: IBarBracket;
  readonly range?: IBarRange;
}

/**
 * Hình cơ bản của một bước: phần tử ngoài vùng `[low, high]` tô `discarded`, chưa có huy hiệu
 * hay ngoặc; thuật toán thêm phần riêng của nó lên trên.
 *
 * @param state Ảnh chụp của bước đang xem.
 * @returns Tone của từng vị trí và mọi vị trí chưa có huy hiệu.
 */
export function getBaseFrame(state: ISearchState): ISearchingFrame {
  return {
    tones: state.array.map((_, index) =>
      index < state.low || index > state.high ? "discarded" : "default",
    ),
    markers: state.array.map(() => []),
  };
}

/**
 * Số phần tử còn có thể chứa `target`, tức độ dài vùng `[low, high]`.
 */
export function getRemainingCount(state: ISearchState): number {
  return Math.max(0, state.high - state.low + 1);
}

/**
 * Một con trỏ cần ghi lên hình, ví dụ `low` ở vị trí 0.
 */
export interface IPointer {
  readonly label: string;
  readonly index: number;
}

/**
 * Đặt các con trỏ thành huy hiệu trên cột. Con trỏ trùng cột được gộp thành một huy hiệu như
 * `low·mid`, vì phía trên cột chỉ đủ chỗ cho hai huy hiệu cộng một ngoặc. Con trỏ nằm ngoài mảng
 * (ví dụ `low = n` khi không tìm thấy) bị bỏ qua.
 *
 * @param length Số phần tử của mảng.
 * @param pointers Các con trỏ theo thứ tự muốn ghi trong nhãn gộp.
 * @returns Huy hiệu của từng vị trí, mỗi vị trí nhiều nhất một huy hiệu.
 */
export function createPointerMarkers(
  length: number,
  pointers: readonly IPointer[],
): readonly (readonly IBarMarker[])[] {
  const labels: string[][] = Array.from({ length }, () => []);
  for (const { label, index } of pointers) {
    if (index >= 0 && index < length) {
      labels[index].push(label);
    }
  }
  return labels.map((group) =>
    group.length === 0 ? [] : [{ label: group.join("·"), tone: "pointer" }],
  );
}
