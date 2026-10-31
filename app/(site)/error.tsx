"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: unknown;
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-24 text-center sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
        Đã xảy ra lỗi
      </h1>
      <p className="max-w-120 text-lg leading-7.5 text-text-secondary">
        Không tải được nội dung trang. Bạn thử lại sau ít phút nhé.
      </p>
      <button
        type="button"
        onClick={retry}
        className="inline-flex h-10 items-center rounded-lg bg-accent-default px-5 text-sm font-medium text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
      >
        Thử lại
      </button>
    </main>
  );
}
