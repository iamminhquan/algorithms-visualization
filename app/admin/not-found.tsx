import Link from "next/link";
import { getButtonClassName } from "@/components/ui/button";
import { ADMIN_ROUTES } from "./_components/admin-routes";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-mono text-sm text-text-muted">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        Không tìm thấy mục này
      </h1>
      <p className="max-w-120 text-text-secondary">
        Mục bạn tìm không tồn tại hoặc đã bị xoá.
      </p>
      <Link
        href={ADMIN_ROUTES.overview}
        className={getButtonClassName("primary")}
      >
        Về trang tổng quan
      </Link>
    </div>
  );
}
