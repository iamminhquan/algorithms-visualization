"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type AdminErrorPageProps = {
  error: unknown;
  retry: () => void;
};

export default function AdminErrorPage({ error, retry }: AdminErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        Đã xảy ra lỗi
      </h1>
      <p className="max-w-120 text-text-secondary">
        Không tải được dữ liệu quản trị. Bạn thử lại sau ít phút nhé.
      </p>
      <Button onClick={retry}>Thử lại</Button>
    </div>
  );
}
