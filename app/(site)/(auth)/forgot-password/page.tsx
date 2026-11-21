import type { Metadata } from "next";
import { LOGIN_PATH } from "@/features/auth/routes";
import { AuthCard } from "../_components/auth-card";
import { AuthLink } from "../_components/auth-link";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Quên mật khẩu"
      showSocialSignIn={false}
      footer={
        <>
          Đã nhớ mật khẩu? <AuthLink href={LOGIN_PATH}>Đăng nhập</AuthLink>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
