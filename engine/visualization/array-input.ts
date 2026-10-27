export const DISPLAY_MAX_LENGTH = 20;
export const MIN_RANDOM_LENGTH = 2;
export const MIN_ARRAY_VALUE = -999;
export const MAX_ARRAY_VALUE = 999;
export const RANDOM_MIN_VALUE = 5;
export const RANDOM_MAX_VALUE = 99;

export type ArrayInputParseResult =
  | { readonly type: "valid"; readonly values: readonly number[] }
  | { readonly type: "invalid"; readonly message: string };

export type IntegerInputParseResult =
  | { readonly type: "valid"; readonly value: number }
  | { readonly type: "invalid"; readonly message: string };

/**
 * Kiểm tra một phần tử của người dùng nhập có là số hay không?
 */
export function parseIntegerInput(token: string): IntegerInputParseResult {
  const trimmed = token.trim();
  if (trimmed === "") {
    return { type: "invalid", message: "Hãy nhập một số." };
  }
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
 * Parse một dãy số thành một đầu vào có thể sử dụng được.
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

/**
 * Sinh mảng số nguyên ngẫu nhiên không có hai phần tử bằng nhau, ví dụ cho tìm kiếm để mỗi
 * giá trị cần tìm chỉ ứng với một vị trí. Chỉ gọi trong event handler, không gọi khi render.
 *
 * @param length Số phần tử, bị kẹp về `[1, maxLength]` và không vượt quá số giá trị có thể chọn.
 * @param maxLength Số phần tử tối đa mà trình mô phỏng nhận.
 * @param random Nguồn số ngẫu nhiên trong `[0, 1)`; truyền vào để test được.
 * @returns Mảng mới gồm các giá trị khác nhau trong `[RANDOM_MIN_VALUE, RANDOM_MAX_VALUE]`.
 */
export function createRandomDistinctArray(
  length: number,
  maxLength: number,
  random: () => number = Math.random,
): readonly number[] {
  const pool = Array.from(
    { length: RANDOM_MAX_VALUE - RANDOM_MIN_VALUE + 1 },
    (_, offset) => RANDOM_MIN_VALUE + offset,
  );
  const size = Math.min(
    Math.max(Math.trunc(length), 1),
    maxLength,
    pool.length,
  );
  for (let i = 0; i < size; i++) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}

function randomInteger(random: () => number): number {
  const span = RANDOM_MAX_VALUE - RANDOM_MIN_VALUE + 1;
  return RANDOM_MIN_VALUE + Math.floor(random() * span);
}
