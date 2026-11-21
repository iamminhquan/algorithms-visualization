"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getAuthErrorMessage } from "@/features/auth/error-messages";
import { getResetPasswordHref } from "@/features/auth/routes";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "../../_components/auth-field";
import { AuthFormMessage } from "../../_components/auth-form-message";
import { AuthSubmitButton } from "../../_components/auth-submit-button";
import { getFormText } from "../../_components/form-data";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = getFormText(formData, "email").trim().toLowerCase();

    setIsPending(true);
    setError(undefined);
    const result = await authClient.emailOtp.requestPasswordReset({ email });
    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      setIsPending(false);
      return;
    }
    router.push(getResetPasswordHref(email));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        id="forgot-password-email"
        name="email"
        type="email"
        label="Email"
        placeholder="ban@example.com"
        autoComplete="email"
        required
      />
      <AuthFormMessage message={error} />
      <AuthSubmitButton
        label="Gửi mã"
        pendingLabel="Đang gửi..."
        isPending={isPending}
      />
    </form>
  );
}
