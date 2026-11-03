import type { Metadata } from "next";
import { REGISTER_PATH } from "@/features/auth/routes";
import { AuthCard } from "../_components/auth-card";
import { AuthLink } from "../_components/auth-link";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
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
      <LoginForm />
    </AuthCard>
  );
}
