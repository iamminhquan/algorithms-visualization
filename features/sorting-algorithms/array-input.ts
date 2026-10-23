import { MAX_INPUT_LENGTH as BUBBLE_SORT_MAX_LENGTH } from "./bubble-sort";
import { MAX_INPUT_LENGTH as SELECTION_SORT_MAX_LENGTH } from "./selection-sort";

/**
 * Số phần tử tối đa để mô phỏng còn dễ theo dõi.
 */
const DISPLAY_MAX_LENGTH = 50;

/**
 * Một input dùng được cho mọi thuật toán sắp xếp, nên lấy giới hạn chặt nhất,
 * kể cả giới hạn hiển thị.
 */
export const MAX_ARRAY_LENGTH = Math.min(
  DISPLAY_MAX_LENGTH,
  BUBBLE_SORT_MAX_LENGTH,
  SELECTION_SORT_MAX_LENGTH,
);

export const MIN_RANDOM_LENGTH = 2;

/**
 * Giới hạn giá trị nhập tay, để nhãn dưới mỗi cột không dài quá bốn ký tự.
 */
export const MIN_ARRAY_VALUE = -999;
export const MAX_ARRAY_VALUE = 999;

/**
 * Khoảng giá trị của mảng ngẫu nhiên; không có số âm hay số 0 để mọi cột đều cao rõ ràng.
 */
const RANDOM_MIN_VALUE = 5;
const RANDOM_MAX_VALUE = 99;

/**
 * Input mặc định khi mở trang. Cố định thay vì ngẫu nhiên, để HTML render ở server khớp với
 * lần render đầu ở trình duyệt.
 */
export const DEFAULT_ARRAY: readonly number[] = Object.freeze([
  38, 27, 43, 3, 9, 82, 10, 55, 19, 64,
]);

export type ArrayInputParseResult =
  | { readonly type: "valid"; readonly values: readonly number[] }
  | { readonly type: "invalid"; readonly message: string };

/**
 * Đọc mảng số nguyên người dùng nhập tay, ví dụ `"5, 3, 8 1"`. Các số cách nhau bởi dấu phẩy,
 * dấu chấm phẩy hoặc khoảng trắng.
 *
 * @param text Chuỗi người dùng nhập.
 * @returns Mảng đã đọc được, hoặc thông báo lỗi tiếng Việt nêu rõ phần tử sai.
 */
export function parseArrayInput(text: string): ArrayInputParseResult {
  const tokens = text.split(/[\s,;]+/).filter((token) => token !== "");
  if (tokens.length === 0) {
    return { type: "invalid", message: "Hãy nhập ít nhất một số." };
  }
  if (tokens.length > MAX_ARRAY_LENGTH) {
    return {
      type: "invalid",
      message: `Chỉ nhập được tối đa ${MAX_ARRAY_LENGTH} phần tử, hiện có ${tokens.length}.`,
    };
  }

  const values: number[] = [];
  for (const token of tokens) {
    /*
     * Không dùng `Number(token)` trực tiếp vì nó nhận cả "0x1f", "1e3" hay "Infinity".
     */
    if (!/^[-+]?\d+$/.test(token)) {
      return {
        type: "invalid",
        message: `"${token}" không phải là số nguyên.`,
      };
    }
    const value = Number(token);
    if (value < MIN_ARRAY_VALUE || value > MAX_ARRAY_VALUE) {
      return {
        type: "invalid",
        message: `${token} nằm ngoài khoảng ${MIN_ARRAY_VALUE} đến ${MAX_ARRAY_VALUE}.`,
      };
    }
    values.push(value);
  }
  return { type: "valid", values };
}

/**
 * Viết mảng thành chuỗi để hiện trong ô nhập; `parseArrayInput` đọc lại được đúng mảng này.
 *
 * @param values Mảng cần hiện.
 * @returns Các số cách nhau bởi dấu phẩy và khoảng trắng.
 */
export function formatArrayInput(values: readonly number[]): string {
  return values.join(", ");
}

/**
 * Sinh mảng số nguyên ngẫu nhiên. Chỉ gọi trong event handler, không gọi khi render.
 *
 * @param length Số phần tử, bị kẹp về `[1, MAX_ARRAY_LENGTH]`.
 * @param random Nguồn số ngẫu nhiên trong `[0, 1)`; truyền vào để test được.
 * @returns Mảng mới có giá trị trong khoảng của mảng ngẫu nhiên.
 */
export function createRandomArray(
  length: number,
  random: () => number = Math.random,
): readonly number[] {
  const size = Math.min(Math.max(Math.trunc(length), 1), MAX_ARRAY_LENGTH);
  const span = RANDOM_MAX_VALUE - RANDOM_MIN_VALUE + 1;
  return Array.from(
    { length: size },
    () => RANDOM_MIN_VALUE + Math.floor(random() * span),
  );
}
