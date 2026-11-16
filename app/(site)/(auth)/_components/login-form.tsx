"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useLayoutEffect, useRef, useState } from "react";
import { getAuthErrorMessage } from "@/features/auth/error-messages";
import { getSafeCallbackUrl, getVerifyEmailHref } from "@/features/auth/routes";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthLink } from "./auth-link";
import { AuthSubmitButton } from "./auth-submit-button";
import { getFormText } from "./form-data";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const afterSignInPath = getSafeCallbackUrl(callbackUrl);
  const formRef = useRef<HTMLFormElement>(null);

  useLayoutEffect(() => {
    return () => {
      setIsPending(false);
      setError(undefined);
      formRef.current?.reset();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = getFormText(formData, "email").trim().toLowerCase();
    const password = getFormText(formData, "password");

    setIsPending(true);
    setError(undefined);
    const result = await authClient.signIn.email({ email, password });
    if (!result.error) {
      router.push(afterSignInPath);
      return;
    }

    if (result.error.code === "EMAIL_NOT_VERIFIED") {
      const resend = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (!resend.error) {
        router.push(getVerifyEmailHref(email));
        return;
      }
      setError(getAuthErrorMessage(resend.error));
    } else {
      setError(getAuthErrorMessage(result.error));
    }
    setIsPending(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        id="login-email"
        name="email"
        type="email"
        label="Email"
        placeholder="ban@example.com"
        autoComplete="email"
        required
      />
      <AuthField
        id="login-password"
        name="password"
        type="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        autoComplete="current-password"
        required
        labelAside={
          <AuthLink href="#" className="text-xs">
            Quên mật khẩu?
          </AuthLink>
        }
      />
      <AuthFormMessage message={error} />
      <AuthSubmitButton
        label="Đăng nhập"
        pendingLabel="Đang đăng nhập..."
        isPending={isPending}
      />
    </form>
  );
}
