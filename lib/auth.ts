import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { after } from "next/server";
import { db } from "@/db";
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationsTable,
} from "@/db/schema";
import { createPasswordResetOtpEmail } from "@/features/auth/emails/password-reset-otp";
import { createVerificationOtpEmail } from "@/features/auth/emails/verification-otp";
import { MIN_PASSWORD_LENGTH, OTP_LENGTH } from "@/features/auth/limits";
import { getResetPasswordHref } from "@/features/auth/routes";
import { sendMail } from "@/lib/mailer";

const OTP_EXPIRES_IN_SECONDS = 600;

function getSocialProviders() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return {};
  }
  return { google: { clientId, clientSecret } };
}

function sendVerificationOtpEmail(email: string, otp: string): void {
  const content = createVerificationOtpEmail({
    otp,
    expiresInMinutes: OTP_EXPIRES_IN_SECONDS / 60,
  });
  after(() =>
    sendMail({ to: email, ...content }).catch((error: unknown) => {
      console.error(`Không gửi được mã xác thực tới ${email}`, error);
    }),
  );
}

function sendPasswordResetOtpEmail(email: string, otp: string): void {
  const baseUrl =
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const content = createPasswordResetOtpEmail({
    otp,
    expiresInMinutes: OTP_EXPIRES_IN_SECONDS / 60,
    resetUrl: `${baseUrl}${getResetPasswordHref(email)}`,
  });
  after(() =>
    sendMail({ to: email, ...content }).catch((error: unknown) => {
      console.error(`Không gửi được mã đặt mật khẩu tới ${email}`, error);
    }),
  );
}

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: false,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  socialProviders: getSocialProviders(),
  plugins: [
    emailOTP({
      otpLength: OTP_LENGTH,
      expiresIn: OTP_EXPIRES_IN_SECONDS,
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          sendVerificationOtpEmail(email, otp);
        }
        if (type === "forget-password") {
          sendPasswordResetOtpEmail(email, otp);
        }
      },
    }),
  ],
});
