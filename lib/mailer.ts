import { createTransport, type Transporter } from "nodemailer";
import "server-only";

export interface IMailMessage {
  readonly to: string;
  readonly subject: string;
  readonly htmlContent: string;
  readonly text: string;
}

interface ISmtpConfig {
  readonly user: string;
  readonly password: string;
  readonly from: string;
}

let transporter: Transporter | undefined;

function readSmtpConfig(): ISmtpConfig | undefined {
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!user || !password) {
    return undefined;
  }
  return { user, password, from: process.env.MAIL_FROM || user };
}

function getTransporter(config: ISmtpConfig): Transporter {
  transporter ??= createTransport({
    host: process.env.GMAIL_SMTP_HOST,
    port: process.env.GMAIL_SMTP_PORT,
    secure: true,
    auth: { user: config.user, pass: config.password },
  });
  return transporter;
}

export async function sendMail(message: IMailMessage): Promise<void> {
  const config = readSmtpConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Chưa đặt biến môi trường SMTP_USER và SMTP_PASSWORD");
    }
    console.info(
      `[mailer] Chưa cấu hình SMTP, email gửi tới ${message.to}:\n${message.subject}\n\n${message.text}`,
    );
    return;
  }

  await getTransporter(config).sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    html: message.htmlContent,
    text: message.text,
  });
}
