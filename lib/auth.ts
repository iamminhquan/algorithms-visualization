import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationsTable,
} from "@/db/schema";
import { createVerificationOtpEmail } from "@/features/auth/emails/verification-otp";
import { MIN_PASSWORD_LENGTH, OTP_LENGTH } from "@/features/auth/limits";
import { sendMail } from "@/lib/mailer";

const OTP_EXPIRES_IN_SECONDS = 600;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name}`);
  }
  return value;
}

function sendVerificationOtpEmail(email: string, otp: string): void {
  const content = createVerificationOtpEmail({
    otp,
    expiresInMinutes: OTP_EXPIRES_IN_SECONDS / 60,
  });
  sendMail({ to: email, ...content }).catch((error: unknown) => {
    console.error(`Không gửi được mã xác thực tới ${email}`, error);
  });
}

export const auth = betterAuth({
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
  socialProviders: {
    google: {
      clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    },
  },
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
      },
    }),
  ],
});
