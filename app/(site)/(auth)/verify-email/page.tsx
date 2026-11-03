import type { Metadata } from "next";
import { Suspense } from "react";
import { OTP_LENGTH } from "@/features/auth/limits";
import { REGISTER_PATH } from "@/features/auth/routes";
import { AuthCard } from "../_components/auth-card";
import { AuthLink } from "../_components/auth-link";
import {
  VerifyEmailView,
  VerifyEmailViewSkeleton,
} from "./_components/verify-email-view";

export const metadata: Metadata = {
  title: "Xác thực email",
  robots: { index: false },
};

export default function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  return (
    <AuthCard
      title="Xác thực email"
      description={`Nhập mã gồm ${OTP_LENGTH} chữ số chúng tôi vừa gửi vào hộp thư của bạn. Nếu không thấy, hãy kiểm tra cả mục thư rác.`}
      showSocialSignIn={false}
      footer={
        <>
          Nhập sai email? <AuthLink href={REGISTER_PATH}>Đăng ký lại</AuthLink>
        </>
      }
    >
      <Suspense fallback={<VerifyEmailViewSkeleton />}>
        <VerifyEmailView searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
