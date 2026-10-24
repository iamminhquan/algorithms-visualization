import { describe, expect, test } from "bun:test";
import {
  createRandomArray,
  formatArrayInput,
  parseArrayInput,
  parseIntegerInput,
  RANDOM_MAX_VALUE,
  RANDOM_MIN_VALUE,
} from "@/engine/visualization";

const MAX_LENGTH = 20;

describe("parseArrayInput", () => {
  test("đọc được số cách nhau bởi dấu phẩy, dấu chấm phẩy và khoảng trắng", () => {
    expect(parseArrayInput(" 5, 3;8  -1\n+2 ", MAX_LENGTH)).toEqual({
      type: "valid",
      values: [5, 3, 8, -1, 2],
    });
  });

  test("chuỗi rỗng báo lỗi", () => {
    expect(parseArrayInput(" , ", MAX_LENGTH).type).toBe("invalid");
  });

  test("từ chối phần tử không phải số nguyên thập phân", () => {
    for (const token of ["abc", "1.5", "0x1f", "1e3", "Infinity", "NaN"]) {
      const result = parseArrayInput(`1, ${token}`, MAX_LENGTH);
      expect(result.type).toBe("invalid");
      if (result.type === "invalid") {
        expect(result.message).toContain(token);
      }
    }
  });

  test("từ chối giá trị ngoài khoảng cho phép", () => {
    expect(parseArrayInput("1000", MAX_LENGTH).type).toBe("invalid");
    expect(parseArrayInput("-1000", MAX_LENGTH).type).toBe("invalid");
    expect(parseArrayInput("-999, 999", MAX_LENGTH).type).toBe("valid");
  });

  test("từ chối mảng dài hơn giới hạn được truyền vào", () => {
    const tooLong = Array.from({ length: MAX_LENGTH + 1 }, () => "1");
    expect(parseArrayInput(tooLong.join(","), MAX_LENGTH).type).toBe("invalid");
    expect(parseArrayInput(tooLong.slice(1).join(","), MAX_LENGTH).type).toBe(
      "valid",
    );
  });

  test("đọc lại được đúng mảng do formatArrayInput viết ra", () => {
    const values = [38, -27, 0, 999];
    expect(parseArrayInput(formatArrayInput(values), MAX_LENGTH)).toEqual({
      type: "valid",
      values,
    });
  });
});

describe("parseIntegerInput", () => {
  test("đọc được số nguyên có dấu và khoảng trắng hai đầu", () => {
    expect(parseIntegerInput("  -42 ")).toEqual({ type: "valid", value: -42 });
    expect(parseIntegerInput("+7")).toEqual({ type: "valid", value: 7 });
  });

  test("từ chối chuỗi rỗng, số không nguyên và số ngoài khoảng", () => {
    for (const token of ["", "  ", "1.5", "0x1f", "abc", "1000", "1 2"]) {
      expect(parseIntegerInput(token).type).toBe("invalid");
    }
  });
});

describe("createRandomArray", () => {
  test("sinh đúng số phần tử, giá trị là số nguyên dương", () => {
    const values = createRandomArray(12, MAX_LENGTH);
    expect(values).toHaveLength(12);
    for (const value of values) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });

  test("giá trị nằm trong khoảng ở cả hai đầu của nguồn ngẫu nhiên", () => {
    const [low] = createRandomArray(1, MAX_LENGTH, () => 0);
    const [high] = createRandomArray(1, MAX_LENGTH, () => 0.999_999);
    expect(low).toBe(RANDOM_MIN_VALUE);
    expect(high).toBe(RANDOM_MAX_VALUE);
  });

  test("số phần tử bị kẹp về khoảng cho phép", () => {
    expect(createRandomArray(0, MAX_LENGTH)).toHaveLength(1);
    expect(createRandomArray(MAX_LENGTH + 50, MAX_LENGTH)).toHaveLength(
      MAX_LENGTH,
    );
  });
});
