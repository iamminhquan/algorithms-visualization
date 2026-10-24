import { DISPLAY_MAX_LENGTH } from "@/engine/visualization";
import { MAX_INPUT_LENGTH as BUBBLE_SORT_MAX_LENGTH } from "./bubble-sort";
import { MAX_INPUT_LENGTH as SELECTION_SORT_MAX_LENGTH } from "./selection-sort";

/**
 * Một input dùng được cho mọi thuật toán sắp xếp, nên lấy giới hạn chặt nhất,
 * kể cả giới hạn hiển thị.
 */
export const MAX_ARRAY_LENGTH = Math.min(
  DISPLAY_MAX_LENGTH,
  BUBBLE_SORT_MAX_LENGTH,
  SELECTION_SORT_MAX_LENGTH,
);

/**
 * Input mặc định khi mở trang. Cố định thay vì ngẫu nhiên, để HTML render ở server khớp với
 * lần render đầu ở trình duyệt.
 */
export const DEFAULT_ARRAY: readonly number[] = Object.freeze([
  38, 27, 43, 3, 9, 82, 10, 55, 19, 64,
]);
