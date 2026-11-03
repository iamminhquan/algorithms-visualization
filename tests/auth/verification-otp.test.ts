import { describe, expect, test } from "bun:test";
import { createVerificationOtpEmail } from "@/features/auth/emails/verification-otp";
import { SITE_NAME } from "@/lib/site";

describe("createVerificationOtpEmail", () => {
  const email = createVerificationOtpEmail({
    otp: "482913",
    expiresInMinutes: 10,
  });

  test("tiêu đề có tên site và mã", () => {
    expect(email.subject).toContain(SITE_NAME);
    expect(email.subject).toContain("482913");
  });

  test("bản HTML và bản chữ thường đều có mã và thời hạn", () => {
    for (const body of [email.htmlContent, email.text]) {
      expect(body).toContain("482913");
      expect(body).toContain("10 phút");
    }
  });

  test("HTML khai báo tiếng Việt", () => {
    expect(email.htmlContent).toContain('<html lang="vi">');
  });
});
