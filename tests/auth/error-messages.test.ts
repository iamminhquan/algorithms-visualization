import { describe, expect, test } from "bun:test";
import {
  GENERIC_AUTH_ERROR_MESSAGE,
  getAuthErrorMessage,
} from "@/features/auth/error-messages";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/limits";

describe("getAuthErrorMessage", () => {
  test("đổi mã lỗi đăng nhập sang câu tiếng Việt", () => {
    expect(getAuthErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe(
      "Email hoặc mật khẩu không đúng.",
    );
  });

  test("đổi mã lỗi OTP sang câu tiếng Việt", () => {
    expect(getAuthErrorMessage({ code: "INVALID_OTP" })).toBe(
      "Mã xác thực không đúng.",
    );
    expect(getAuthErrorMessage({ code: "OTP_EXPIRED" })).toContain("hết hạn");
    expect(getAuthErrorMessage({ code: "TOO_MANY_ATTEMPTS" })).toContain(
      "quá nhiều lần",
    );
  });

  test("nêu độ dài tối thiểu khi mật khẩu quá ngắn", () => {
    expect(getAuthErrorMessage({ code: "PASSWORD_TOO_SHORT" })).toContain(
      String(MIN_PASSWORD_LENGTH),
    );
  });

  test("đổi mã lỗi thêm mật khẩu sang câu tiếng Việt", () => {
    expect(getAuthErrorMessage({ code: "PASSWORD_ALREADY_SET" })).toContain(
      "đã có mật khẩu",
    );
    expect(getAuthErrorMessage({ code: "UNAUTHORIZED" })).toContain(
      "đăng nhập lại",
    );
  });

  test("ưu tiên báo giới hạn tần suất khi status là 429", () => {
    expect(getAuthErrorMessage({ code: "INVALID_OTP", status: 429 })).toContain(
      "quá nhanh",
    );
  });

  test("trả câu chung cho mã lạ hoặc không có mã", () => {
    expect(getAuthErrorMessage({ code: "SOMETHING_ELSE" })).toBe(
      GENERIC_AUTH_ERROR_MESSAGE,
    );
    expect(getAuthErrorMessage({})).toBe(GENERIC_AUTH_ERROR_MESSAGE);
    expect(getAuthErrorMessage({ code: "toString" })).toBe(
      GENERIC_AUTH_ERROR_MESSAGE,
    );
  });
});
