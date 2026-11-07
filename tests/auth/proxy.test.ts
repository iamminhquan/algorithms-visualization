import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function createRequest(cookie?: string): NextRequest {
  return new NextRequest("https://example.com/admin", {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("proxy quản trị", () => {
  test("chuyển về trang đăng nhập khi chưa có phiên", () => {
    const response = proxy(createRequest());

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.com/login?next=%2Fadmin",
    );
  });

  test("cho qua khi có cookie phiên thường", () => {
    const response = proxy(createRequest("better-auth.session_token=abc.sig"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  test("cho qua khi có cookie phiên bảo mật trên production", () => {
    const response = proxy(
      createRequest("__Secure-better-auth.session_token=abc.sig"),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
