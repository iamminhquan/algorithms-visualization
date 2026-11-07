import { SITE_NAME } from "@/lib/site";
import type { IEmailContent } from "./verification-otp";

export interface IPasswordResetOtpEmailInput {
  readonly otp: string;
  readonly expiresInMinutes: number;
  readonly resetUrl: string;
}

export function createPasswordResetOtpEmail({
  otp,
  expiresInMinutes,
  resetUrl,
}: IPasswordResetOtpEmailInput): IEmailContent {
  const subject = `Đặt mật khẩu tài khoản ${SITE_NAME}: ${otp}`;
  const intro = `Dùng mã dưới đây để đặt mật khẩu cho tài khoản ${SITE_NAME} của bạn.`;
  const linkText = `Mở trang đặt mật khẩu: ${resetUrl}`;
  const expiry = `Mã có hiệu lực trong ${expiresInMinutes} phút.`;
  const ignore =
    "Nếu bạn không yêu cầu đặt mật khẩu, hãy bỏ qua email này. Không chia sẻ mã cho bất kỳ ai.";

  const text = [intro, "", otp, "", linkText, "", expiry, ignore].join("\n");

  const htmlContent = `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px">
            <tr><td style="font-size:20px;font-weight:600;padding-bottom:16px">${SITE_NAME}</td></tr>
            <tr><td style="font-size:15px;line-height:22px;padding-bottom:24px">${intro}</td></tr>
            <tr><td align="center" style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px;background:#f5f5f4;border-radius:8px">${otp}</td></tr>
            <tr><td align="center" style="padding-top:24px"><a href="${resetUrl}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 20px;font-size:15px">Đặt mật khẩu</a></td></tr>
            <tr><td style="font-size:14px;line-height:20px;padding-top:24px">${expiry}</td></tr>
            <tr><td style="font-size:13px;line-height:20px;color:#78716c;padding-top:8px">${ignore}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, htmlContent, text };
}
