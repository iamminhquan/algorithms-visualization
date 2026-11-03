import { SITE_NAME } from "@/lib/site";

export interface IEmailContent {
  readonly subject: string;
  readonly htmlContent: string;
  readonly text: string;
}

export interface IVerificationOtpEmailInput {
  readonly otp: string;
  readonly expiresInMinutes: number;
}

export function createVerificationOtpEmail({
  otp,
  expiresInMinutes,
}: IVerificationOtpEmailInput): IEmailContent {
  const subject = `Mã xác thực email ${SITE_NAME}: ${otp}`;
  const intro = `Dùng mã dưới đây để xác thực email cho tài khoản ${SITE_NAME} của bạn.`;
  const expiry = `Mã có hiệu lực trong ${expiresInMinutes} phút.`;
  const ignore =
    "Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này. Không chia sẻ mã cho bất kỳ ai.";

  const text = [intro, "", otp, "", expiry, ignore].join("\n");

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
