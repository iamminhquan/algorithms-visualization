import { describe, expect, test } from "bun:test";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/limits";
import {
  getNewPasswordError,
  getPasswordLengthError,
} from "@/features/auth/password";

describe("getPasswordLengthError", () => {
  test("báo lỗi khi mật khẩu ngắn hơn giới hạn", () => {
    expect(
      getPasswordLengthError("a".repeat(MIN_PASSWORD_LENGTH - 1)),
    ).toContain(String(MIN_PASSWORD_LENGTH));
  });

  test("chấp nhận mật khẩu đủ dài", () => {
    expect(getPasswordLengthError("a".repeat(MIN_PASSWORD_LENGTH))).toBe(
      undefined,
    );
  });
});

describe("getNewPasswordError", () => {
  test("ưu tiên báo lỗi độ dài trước lỗi không khớp", () => {
    expect(getNewPasswordError("ngan", "khac")).toContain(
      String(MIN_PASSWORD_LENGTH),
    );
  });

  test("báo lỗi khi hai lần nhập không khớp", () => {
    expect(
      getNewPasswordError(
        "a".repeat(MIN_PASSWORD_LENGTH),
        `${"a".repeat(MIN_PASSWORD_LENGTH)}b`,
      ),
    ).toBe("Hai lần nhập mật khẩu không khớp.");
  });

  test("trả undefined khi mật khẩu hợp lệ và khớp", () => {
    const password = "a".repeat(MIN_PASSWORD_LENGTH);
    expect(getNewPasswordError(password, password)).toBe(undefined);
  });
});
