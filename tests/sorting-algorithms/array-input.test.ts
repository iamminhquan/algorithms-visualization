import { describe, expect, test } from "bun:test";
import {
  createRandomArray,
  DEFAULT_ARRAY,
  formatArrayInput,
  MAX_ARRAY_LENGTH,
  parseArrayInput,
} from "@/features/sorting-algorithms/array-input";

describe("parseArrayInput", () => {
  test("đọc được số cách nhau bởi dấu phẩy, dấu chấm phẩy và khoảng trắng", () => {
    expect(parseArrayInput(" 5, 3;8  -1\n+2 ")).toEqual({
      type: "valid",
      values: [5, 3, 8, -1, 2],
    });
  });

  test("chuỗi rỗng báo lỗi", () => {
    expect(parseArrayInput(" , ").type).toBe("invalid");
  });

  test("từ chối phần tử không phải số nguyên thập phân", () => {
    for (const token of ["abc", "1.5", "0x1f", "1e3", "Infinity", "NaN"]) {
      const result = parseArrayInput(`1, ${token}`);
      expect(result.type).toBe("invalid");
      if (result.type === "invalid") {
        expect(result.message).toContain(token);
      }
    }
  });

  test("từ chối giá trị ngoài khoảng cho phép", () => {
    expect(parseArrayInput("1000").type).toBe("invalid");
    expect(parseArrayInput("-1000").type).toBe("invalid");
    expect(parseArrayInput("-999, 999").type).toBe("valid");
  });

  test("từ chối mảng dài hơn giới hạn của thuật toán", () => {
    const tooLong = Array.from({ length: MAX_ARRAY_LENGTH + 1 }, () => "1");
    expect(parseArrayInput(tooLong.join(",")).type).toBe("invalid");
    expect(parseArrayInput(tooLong.slice(1).join(",")).type).toBe("valid");
  });

  test("đọc lại được đúng mảng do formatArrayInput viết ra", () => {
    expect(parseArrayInput(formatArrayInput(DEFAULT_ARRAY))).toEqual({
      type: "valid",
      values: [...DEFAULT_ARRAY],
    });
  });
});

describe("createRandomArray", () => {
  test("sinh đúng số phần tử, giá trị là số nguyên dương", () => {
    const values = createRandomArray(12);
    expect(values).toHaveLength(12);
    for (const value of values) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });

  test("giá trị nằm trong khoảng ở cả hai đầu của nguồn ngẫu nhiên", () => {
    const [low] = createRandomArray(1, () => 0);
    const [high] = createRandomArray(1, () => 0.999_999);
    expect(low).toBe(5);
    expect(high).toBe(99);
  });

  test("số phần tử bị kẹp về khoảng cho phép", () => {
    expect(createRandomArray(0)).toHaveLength(1);
    expect(createRandomArray(MAX_ARRAY_LENGTH + 50)).toHaveLength(
      MAX_ARRAY_LENGTH,
    );
  });
});
