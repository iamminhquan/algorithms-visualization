import Link from "next/link";
import { cn } from "@/lib/cn";

type LoginLinkProps = {
  /** Kiểu hiển thị (display), chiều cao và độ rộng do nơi dùng quyết định vì mỗi nơi một khác. */
  className: string;
  onNavigate?: () => void;
};

/** Nút "Đăng nhập" dùng chung cho header (màn hình rộng) và bảng menu (màn hình hẹp). */
export function LoginLink({ className, onNavigate }: LoginLinkProps) {
  return (
    <Link
      href="/login"
      onClick={onNavigate}
      className={cn(
        "items-center justify-center rounded-lg bg-accent-default px-5 text-sm font-medium whitespace-nowrap text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default",
        className,
      )}
    >
      Đăng nhập
    </Link>
  );
}
