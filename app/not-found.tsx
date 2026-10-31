import type { Metadata } from "next";
import Link from "next/link";
import { VISUALIZATION_PATH } from "@/features/catalog/routes";
import { SiteHeader } from "./_components/header/site-header";
import { SiteFooter } from "./_components/site-footer";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-24 text-center sm:px-8">
        <p className="font-mono text-sm text-text-muted">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Không tìm thấy trang
        </h1>
        <p className="max-w-120 text-lg leading-7.5 text-text-secondary">
          Trang bạn tìm không tồn tại hoặc đã được chuyển đi.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={VISUALIZATION_PATH}
            className="inline-flex h-10 items-center rounded-lg bg-accent-default px-5 text-sm font-medium text-accent-on transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
          >
            Xem danh sách thuật toán
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg border border-border-strong px-5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
