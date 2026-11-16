import type { Metadata } from "next";
import { Suspense } from "react";
import { REGISTER_PATH } from "@/features/auth/routes";
import { AuthCard } from "../_components/auth-card";
import { AuthLink } from "../_components/auth-link";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard
      title="Đăng nhập"
      description="Chào mừng bạn quay lại. Đăng nhập để lưu tiến độ học và các lượt mô phỏng của bạn."
      footer={
        <>
          Bạn chưa có tài khoản?{" "}
          <AuthLink href={REGISTER_PATH}>Đăng ký ngay</AuthLink>
        </>
      }
    >
      <Suspense fallback={<LoginForm />}>
        <LoginFormView searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

type LoginFormViewProps = Pick<PageProps<"/login">, "searchParams">;

async function LoginFormView({ searchParams }: LoginFormViewProps) {
  const callbackUrl = (await searchParams).callbackUrl;
  const callbackValue = Array.isArray(callbackUrl)
    ? callbackUrl.at(0)
    : callbackUrl;

  return <LoginForm callbackUrl={callbackValue} />;
}
