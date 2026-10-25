import type { Metadata } from "next";
import { AuthCard } from "../_components/auth-card";
import { AuthField } from "../_components/auth-field";
import { AuthLink } from "../_components/auth-link";
import { AuthSubmitButton } from "../_components/auth-submit-button";

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
          <AuthLink href="/register">Đăng ký ngay</AuthLink>
        </>
      }
    >
      <form className="flex flex-col gap-4">
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
        <AuthSubmitButton label="Đăng nhập" />
      </form>
    </AuthCard>
  );
}
