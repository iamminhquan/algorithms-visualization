/**
 * Số phần tử tối đa để mô phỏng còn dễ theo dõi; dài hơn thì cột quá hẹp để ghi giá trị bên dưới.
 */
export const DISPLAY_MAX_LENGTH = 20;

export const MIN_RANDOM_LENGTH = 2;

/**
 * Giới hạn giá trị nhập tay, để nhãn dưới mỗi cột không dài quá bốn ký tự.
 */
export const MIN_ARRAY_VALUE = -999;
export const MAX_ARRAY_VALUE = 999;

/**
 * Khoảng giá trị của mảng ngẫu nhiên; không có số âm hay số 0 để mọi cột đều cao rõ ràng.
 */
export const RANDOM_MIN_VALUE = 5;
export const RANDOM_MAX_VALUE = 99;

export type ArrayInputParseResult =
  | { readonly type: "valid"; readonly values: readonly number[] }
  | { readonly type: "invalid"; readonly message: string };

export type IntegerInputParseResult =
  | { readonly type: "valid"; readonly value: number }
  | { readonly type: "invalid"; readonly message: string };

/**
 * Đọc một số nguyên người dùng nhập tay, ví dụ giá trị cần tìm.
 *
 * @param token Chuỗi người dùng nhập, đã bỏ khoảng trắng hai đầu hoặc chưa.
 * @returns Số đã đọc được, hoặc thông báo lỗi tiếng Việt nêu rõ giá trị sai.
 */
export function parseIntegerInput(token: string): IntegerInputParseResult {
  const trimmed = token.trim();
  if (trimmed === "") {
    return { type: "invalid", message: "Hãy nhập một số." };
  }
  /*
   * Không dùng `Number(token)` trực tiếp vì nó nhận cả "0x1f", "1e3" hay "Infinity".
   */
  if (!/^[-+]?\d+$/.test(trimmed)) {
    return {
      type: "invalid",
      message: `"${trimmed}" không phải là số nguyên.`,
    };
  }
  const value = Number(trimmed);
  if (value < MIN_ARRAY_VALUE || value > MAX_ARRAY_VALUE) {
    return {
      type: "invalid",
      message: `${trimmed} nằm ngoài khoảng ${MIN_ARRAY_VALUE} đến ${MAX_ARRAY_VALUE}.`,
    };
  }
  return { type: "valid", value };
}

/**
 * Đọc mảng số nguyên người dùng nhập tay, ví dụ `"5, 3, 8 1"`. Các số cách nhau bởi dấu phẩy,
 * dấu chấm phẩy hoặc khoảng trắng.
 *
 * @param text Chuỗi người dùng nhập.
 * @param maxLength Số phần tử tối đa mà trình mô phỏng nhận.
 * @returns Mảng đã đọc được, hoặc thông báo lỗi tiếng Việt nêu rõ phần tử sai.
 */
export function parseArrayInput(
  text: string,
  maxLength: number,
): ArrayInputParseResult {
  const tokens = text.split(/[\s,;]+/).filter((token) => token !== "");
  if (tokens.length === 0) {
    return { type: "invalid", message: "Hãy nhập ít nhất một số." };
  }
  if (tokens.length > maxLength) {
    return {
      type: "invalid",
      message: `Chỉ nhập được tối đa ${maxLength} phần tử, hiện có ${tokens.length}.`,
    };
  }

  const values: number[] = [];
  for (const token of tokens) {
    const result = parseIntegerInput(token);
    if (result.type === "invalid") {
      return result;
    }
    values.push(result.value);
  }
  return { type: "valid", values };
}

/**
 * Viết mảng thành chuỗi để hiện trong ô nhập; `parseArrayInput` đọc lại được đúng mảng này.
 *
 * @param values Mảng cần hiện.
 * @returns Các số cách nhau bởi một khoảng trắng.
 */
export function formatArrayInput(values: readonly number[]): string {
  return values.join(" ");
}

/**
 * Sinh mảng số nguyên ngẫu nhiên. Chỉ gọi trong event handler, không gọi khi render.
 *
 * @param length Số phần tử, bị kẹp về `[1, maxLength]`.
 * @param maxLength Số phần tử tối đa mà trình mô phỏng nhận.
 * @param random Nguồn số ngẫu nhiên trong `[0, 1)`; truyền vào để test được.
 * @returns Mảng mới có giá trị trong `[RANDOM_MIN_VALUE, RANDOM_MAX_VALUE]`.
 */
export function createRandomArray(
  length: number,
  maxLength: number,
  random: () => number = Math.random,
): readonly number[] {
  const size = Math.min(Math.max(Math.trunc(length), 1), maxLength);
  return Array.from({ length: size }, () => randomInteger(random));
}

function randomInteger(random: () => number): number {
  const span = RANDOM_MAX_VALUE - RANDOM_MIN_VALUE + 1;
  return RANDOM_MIN_VALUE + Math.floor(random() * span);
}
