"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/features/auth/error-messages";
import {
  OTP_LENGTH,
  RESEND_OTP_COOLDOWN_SECONDS,
} from "@/features/auth/limits";
import { AFTER_SIGN_IN_PATH } from "@/features/auth/routes";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthSubmitButton } from "./auth-submit-button";
import { getFormText } from "./form-data";

type VerifyEmailFormProps = {
  email: string;
};

const ONE_SECOND_MS = 1000;

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const [cooldown, setCooldown] = useState(RESEND_OTP_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown(cooldown - 1), ONE_SECOND_MS);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const otp = getFormText(new FormData(event.currentTarget), "otp").trim();

    setIsPending(true);
    setError(undefined);
    setNotice(undefined);
    const result = await authClient.emailOtp.verifyEmail({ email, otp });
    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      setIsPending(false);
      return;
    }
    router.push(AFTER_SIGN_IN_PATH);
  }

  async function handleResend() {
    setIsResending(true);
    setError(undefined);
    setNotice(undefined);
    const result = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setIsResending(false);
    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      return;
    }
    setNotice("Đã gửi mã mới. Hãy kiểm tra hộp thư của bạn.");
    setCooldown(RESEND_OTP_COOLDOWN_SECONDS);
  }

  const canResend = cooldown <= 0 && !isResending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        id="verify-email-otp"
        name="otp"
        label="Mã xác thực"
        placeholder={"0".repeat(OTP_LENGTH)}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern={`\\d{${OTP_LENGTH}}`}
        maxLength={OTP_LENGTH}
        title={`Nhập đủ ${OTP_LENGTH} chữ số`}
        className="text-center tracking-[0.5em]"
        required
      />
      <AuthFormMessage message={error} />
      <AuthFormMessage message={notice} tone="success" />
      <AuthSubmitButton
        label="Xác thực"
        pendingLabel="Đang xác thực..."
        isPending={isPending}
      />
      <button
        type="button"
        onClick={handleResend}
        disabled={!canResend}
        className="self-center rounded-sm text-sm font-medium text-accent-text transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:pointer-events-none disabled:text-text-muted"
      >
        {isResending
          ? "Đang gửi lại mã..."
          : cooldown > 0
            ? `Gửi lại mã sau ${cooldown} giây`
            : "Gửi lại mã"}
      </button>
    </form>
  );
}
