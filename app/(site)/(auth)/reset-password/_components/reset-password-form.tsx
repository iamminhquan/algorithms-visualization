"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/features/auth/error-messages";
import {
  MIN_PASSWORD_LENGTH,
  OTP_LENGTH,
  RESEND_OTP_COOLDOWN_SECONDS,
} from "@/features/auth/limits";
import { getNewPasswordError } from "@/features/auth/password";
import { LOGIN_PATH } from "@/features/auth/routes";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "../../_components/auth-field";
import { AuthFormMessage } from "../../_components/auth-form-message";
import { AuthSubmitButton } from "../../_components/auth-submit-button";
import { getFormText } from "../../_components/form-data";

type ResetPasswordFormProps = {
  email: string;
};

const ONE_SECOND_MS = 1000;
const LINK_BUTTON_CLASS =
  "self-center rounded-sm text-sm font-medium text-accent-text transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:pointer-events-none disabled:text-text-muted";

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState<string | undefined>(undefined);
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

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const otp = getFormText(new FormData(event.currentTarget), "otp").trim();

    setIsPending(true);
    setError(undefined);
    setNotice(undefined);
    const result = await authClient.emailOtp.checkVerificationOtp({
      email,
      type: "forget-password",
      otp,
    });
    setIsPending(false);
    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      return;
    }
    setVerifiedOtp(otp);
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (verifiedOtp === undefined) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const password = getFormText(formData, "password");
    const passwordConfirm = getFormText(formData, "passwordConfirm");

    const passwordError = getNewPasswordError(password, passwordConfirm);
    if (passwordError !== undefined) {
      setError(passwordError);
      return;
    }

    setIsPending(true);
    setError(undefined);
    const result = await authClient.emailOtp.resetPassword({
      email,
      otp: verifiedOtp,
      password,
    });
    setIsPending(false);
    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      return;
    }
    setIsComplete(true);
  }

  async function handleResend() {
    setIsResending(true);
    setError(undefined);
    setNotice(undefined);
    const result = await authClient.emailOtp.requestPasswordReset({ email });
    setIsResending(false);
    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      return;
    }
    setNotice("Đã gửi mã mới. Hãy kiểm tra hộp thư của bạn.");
    setCooldown(RESEND_OTP_COOLDOWN_SECONDS);
  }

  function handleUseAnotherOtp() {
    setVerifiedOtp(undefined);
    setError(undefined);
    setNotice(undefined);
  }

  if (isComplete) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm leading-6 text-text-secondary">
          Mật khẩu đã được đặt cho{" "}
          <span className="font-medium break-all text-text-primary">
            {email}
          </span>
          . Bạn có thể đăng nhập bằng mật khẩu mới.
        </p>
        <Link
          href={LOGIN_PATH}
          className="rounded-sm font-medium text-accent-text hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
        >
          Đến trang đăng nhập
        </Link>
      </div>
    );
  }

  if (verifiedOtp !== undefined) {
    return (
      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        <AuthField
          id="reset-password-password"
          name="password"
          type="password"
          label="Mật khẩu mới"
          placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <AuthField
          id="reset-password-confirm"
          name="passwordConfirm"
          type="password"
          label="Nhập lại mật khẩu"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          required
        />
        <AuthFormMessage message={error} />
        <AuthSubmitButton
          label="Đặt mật khẩu"
          pendingLabel="Đang lưu..."
          isPending={isPending}
        />
        <button
          type="button"
          onClick={handleUseAnotherOtp}
          className={LINK_BUTTON_CLASS}
        >
          Dùng mã khác
        </button>
      </form>
    );
  }

  const canResend = cooldown <= 0 && !isResending;

  return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
      <p className="text-center text-sm text-text-secondary">
        Nhập mã xác thực đã gửi tới{" "}
        <span className="font-medium break-all text-text-primary">{email}</span>
      </p>
      <AuthField
        id="reset-password-otp"
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
        label="Tiếp tục"
        pendingLabel="Đang kiểm tra..."
        isPending={isPending}
      />
      <button
        type="button"
        onClick={handleResend}
        disabled={!canResend}
        className={LINK_BUTTON_CLASS}
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
