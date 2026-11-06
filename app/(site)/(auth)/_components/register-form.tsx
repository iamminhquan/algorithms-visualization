"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getAuthErrorMessage } from "@/features/auth/error-messages";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/limits";
import { getNewPasswordError } from "@/features/auth/password";
import { getVerifyEmailHref } from "@/features/auth/routes";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthSubmitButton } from "./auth-submit-button";
import { getFormText } from "./form-data";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = getFormText(formData, "name").trim();
    const email = getFormText(formData, "email").trim().toLowerCase();
    const password = getFormText(formData, "password");
    const passwordConfirm = getFormText(formData, "passwordConfirm");

    const passwordError = getNewPasswordError(password, passwordConfirm);
    if (passwordError !== undefined) {
      setError(passwordError);
      return;
    }

    setIsPending(true);
    setError(undefined);
    const result = await authClient.signUp.email({ name, email, password });
    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      setIsPending(false);
      return;
    }
    router.push(getVerifyEmailHref(email));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        id="register-name"
        name="name"
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        autoComplete="name"
        required
      />
      <AuthField
        id="register-email"
        name="email"
        type="email"
        label="Email"
        placeholder="ban@example.com"
        autoComplete="email"
        required
      />
      <AuthField
        id="register-password"
        name="password"
        type="password"
        label="Mật khẩu"
        placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      <AuthField
        id="register-password-confirm"
        name="passwordConfirm"
        type="password"
        label="Nhập lại mật khẩu"
        placeholder="Nhập lại mật khẩu"
        autoComplete="new-password"
        required
      />
      <AuthFormMessage message={error} />
      <AuthSubmitButton
        label="Đăng ký"
        pendingLabel="Đang tạo tài khoản..."
        isPending={isPending}
      />
    </form>
  );
}
