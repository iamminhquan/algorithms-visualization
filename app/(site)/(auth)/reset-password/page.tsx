import type { Metadata } from "next";
import { Suspense } from "react";
import { OTP_LENGTH } from "@/features/auth/limits";
import { LOGIN_PATH } from "@/features/auth/routes";
import { AuthCard } from "../_components/auth-card";
import { AuthLink } from "../_components/auth-link";
import {
  ResetPasswordView,
  ResetPasswordViewSkeleton,
} from "./_components/reset-password-view";

export const metadata: Metadata = {
  title: "Đặt mật khẩu",
  robots: { index: false },
};

export default function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  return (
    <AuthCard
      title="Đặt mật khẩu"
      description={`Nhập mã gồm ${OTP_LENGTH} chữ số trong email khôi phục và chọn mật khẩu mới cho tài khoản của bạn.`}
      showSocialSignIn={false}
      footer={
        <>
          Đã có mật khẩu? <AuthLink href={LOGIN_PATH}>Đăng nhập</AuthLink>
        </>
      }
    >
      <Suspense fallback={<ResetPasswordViewSkeleton />}>
        <ResetPasswordView searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
