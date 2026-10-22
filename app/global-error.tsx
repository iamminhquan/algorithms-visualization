"use client";

import { SITE_NAME } from "@/lib/site";
import "./globals.css";

type GlobalErrorProps = {
  error: unknown;
  retry: () => void;
};

/*
 * Thay cho root layout khi chính layout bị lỗi, nên phải tự có <html>, <body> và CSS.
 * Error boundary là Client Component nên không export `metadata` được, dùng <title> của React.
 */
export default function GlobalError({ retry }: GlobalErrorProps) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-5 px-4 text-center">
        <title>{`Đã xảy ra lỗi | ${SITE_NAME}`}</title>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Đã xảy ra lỗi
        </h1>
        <p className="max-w-120 text-lg leading-7.5 text-text-secondary">
          Không tải được trang. Bạn thử lại sau ít phút nhé.
        </p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex h-10 items-center rounded-lg bg-accent-default px-5 text-sm font-medium text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
        >
          Thử lại
        </button>
      </body>
    </html>
  );
}
