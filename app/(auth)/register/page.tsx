import type { Metadata } from "next";
import { AuthCard } from "../_components/auth-card";
import { AuthField } from "../_components/auth-field";
import { AuthLink } from "../_components/auth-link";
import { AuthSubmitButton } from "../_components/auth-submit-button";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Tạo tài khoản"
      description="Đăng ký miễn phí để lưu tiến độ học và quay lại các bài mô phỏng bất cứ lúc nào."
      footer={
        <>
          Bạn đã có tài khoản? <AuthLink href="/login">Đăng nhập</AuthLink>
        </>
      }
    >
      <form className="flex flex-col gap-4">
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
          placeholder="Ít nhất 8 ký tự"
          autoComplete="new-password"
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
        <AuthSubmitButton label="Đăng ký" />
      </form>
    </AuthCard>
  );
}
