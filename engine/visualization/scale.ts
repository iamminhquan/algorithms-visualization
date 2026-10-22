/**
 * Chiều cao tối thiểu của một cột, tính theo phần trăm, để cột nhỏ nhất vẫn nhìn và bấm thấy được.
 */
export const MIN_BAR_HEIGHT_PERCENT = 8;

/**
 * Quy đổi giá trị thành chiều cao cột theo phần trăm của vùng vẽ. Thang đo luôn chứa 0, nên
 * mảng toàn số dương giữ đúng tỉ lệ giữa các cột; có số âm thì đáy thang là giá trị nhỏ nhất,
 * vì cột không vẽ xuống dưới trục.
 *
 * @param values Các giá trị cần vẽ.
 * @returns Chiều cao của từng cột, trong khoảng `[MIN_BAR_HEIGHT_PERCENT, 100]`.
 */
export function scaleBarHeights(values: readonly number[]): readonly number[] {
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values);
  const span = high - low;
  if (span === 0) {
    return values.map(() => MIN_BAR_HEIGHT_PERCENT);
  }
  return values.map(
    (value) =>
      MIN_BAR_HEIGHT_PERCENT +
      ((value - low) / span) * (100 - MIN_BAR_HEIGHT_PERCENT),
  );
}
