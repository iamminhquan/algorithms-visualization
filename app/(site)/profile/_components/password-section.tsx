"use client";

import { type FormEvent, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { addPasswordAction } from "@/features/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/limits";
import { getNewPasswordError } from "@/features/auth/password";

type PasswordSectionProps = {
  hasPassword: boolean;
  hasGoogle: boolean;
};

function getPasswordDescription(
  hasPassword: boolean,
  hasGoogle: boolean,
): string {
  if (hasPassword) {
    return hasGoogle
      ? "Bạn có thể đăng nhập bằng email và mật khẩu, hoặc tiếp tục dùng Google."
      : "Bạn có thể đăng nhập bằng email và mật khẩu.";
  }
  return hasGoogle
    ? "Tài khoản này đang đăng nhập bằng Google. Thêm mật khẩu để có thể đăng nhập bằng email."
    : "Thêm mật khẩu để có thể đăng nhập bằng email.";
}

export function PasswordSection({
  hasPassword: initialHasPassword,
  hasGoogle,
}: PasswordSectionProps) {
  const passwordId = useId();
  const confirmationId = useId();
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    const validationError = getNewPasswordError(password, confirmation);
    if (validationError !== undefined) {
      setError(validationError);
      setSuccess(undefined);
      return;
    }

    setIsPending(true);
    setError(undefined);
    setSuccess(undefined);
    const result = await addPasswordAction(password);
    setIsPending(false);
    if (!result.ok) {
      setError(result.message ?? "Không thể thêm mật khẩu. Vui lòng thử lại.");
      return;
    }
    setHasPassword(true);
    setSuccess(
      "Đã thêm mật khẩu. Bây giờ bạn có thể đăng nhập bằng email và mật khẩu.",
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-bg-subtle p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-text-primary">Email và mật khẩu</p>
          <p className="mt-1 text-sm leading-5.5 text-text-secondary">
            {getPasswordDescription(hasPassword, hasGoogle)}
          </p>
        </div>
        <Badge tone={hasPassword ? "success" : "warning"}>
          {hasPassword ? "Đã thiết lập" : "Chưa thiết lập"}
        </Badge>
      </div>

      {success ? (
        <output className="text-sm text-success-text">{success}</output>
      ) : null}

      {hasPassword ? null : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Mật khẩu mới" htmlFor={passwordId}>
              <Input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                placeholder={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`}
                className="h-11"
                required
              />
            </FormField>
            <FormField label="Nhập lại mật khẩu" htmlFor={confirmationId}>
              <Input
                id={confirmationId}
                name="confirmation"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                placeholder="Nhập lại mật khẩu"
                className="h-11"
                required
              />
            </FormField>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-danger-text">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 self-start px-5"
          >
            {isPending ? "Đang thêm mật khẩu..." : "Thêm mật khẩu"}
          </Button>
        </form>
      )}
    </div>
  );
}
