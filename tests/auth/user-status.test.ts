import { describe, expect, test } from "bun:test";
import { getUserStatus } from "@/features/auth/user-types";

describe("getUserStatus", () => {
  test("trả về locked khi tài khoản bị khoá", () => {
    expect(getUserStatus({ emailVerified: true, isLocked: true })).toBe(
      "locked",
    );
    expect(getUserStatus({ emailVerified: false, isLocked: true })).toBe(
      "locked",
    );
  });

  test("trả về active khi email đã xác thực", () => {
    expect(getUserStatus({ emailVerified: true, isLocked: false })).toBe(
      "active",
    );
  });

  test("trả về invited khi email chưa xác thực", () => {
    expect(getUserStatus({ emailVerified: false, isLocked: false })).toBe(
      "invited",
    );
  });
});
