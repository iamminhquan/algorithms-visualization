import {
  DISPLAY_MAX_LENGTH,
  RANDOM_MAX_VALUE,
  RANDOM_MIN_VALUE,
} from "@/engine/visualization";

/**
 * Xác suất chọn target có trong mảng; phần còn lại chọn số không có, để người xem gặp cả
 * trường hợp không tìm thấy.
 */
export const MAX_ARRAY_LENGTH = DISPLAY_MAX_LENGTH;

/**
 * Input mặc định khi mở trang. Cố định thay vì ngẫu nhiên, để HTML render ở server khớp với
 * lần render đầu ở trình duyệt. `DEFAULT_TARGET` có trong mảng, nằm ở nửa sau để Linear Search
 * cần nhiều lần so sánh còn Binary Search chỉ cần vài lần.
 */
export const DEFAULT_ARRAY: readonly number[] = Object.freeze([
  38, 27, 43, 3, 9, 82, 10, 55, 19, 64,
]);
export const DEFAULT_TARGET = 55;

/**
 * Xác suất chọn target có trong mảng; phần còn lại chọn số không có, để người xem gặp cả
 * trường hợp không tìm thấy.
 */
const PRESENT_TARGET_PROBABILITY = 0.7;

/**
 * Sắp xếp tăng dần trên bản sao, dùng cho Binary Search.
 */
export function sortAscending(values: readonly number[]): readonly number[] {
  return [...values].sort((left, right) => left - right);
}

export function pickRandomTarget(
  values: readonly number[],
  random: () => number = Math.random,
): number {
  const present = new Set(values);
  const absent: number[] = [];
  for (let value = RANDOM_MIN_VALUE; value <= RANDOM_MAX_VALUE; value++) {
    if (!present.has(value)) {
      absent.push(value);
    }
  }

  const wantsPresent = random() < PRESENT_TARGET_PROBABILITY;
  if (values.length > 0 && (wantsPresent || absent.length === 0)) {
    return values[Math.floor(random() * values.length)];
  }
  return absent[Math.floor(random() * absent.length)];
}
