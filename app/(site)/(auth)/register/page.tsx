import type { Metadata } from "next";
import { LOGIN_PATH } from "@/features/auth/routes";
import { AuthCard } from "../_components/auth-card";
import { AuthLink } from "../_components/auth-link";
import { RegisterForm } from "../_components/register-form";

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
          Bạn đã có tài khoản? <AuthLink href={LOGIN_PATH}>Đăng nhập</AuthLink>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
