import type { Metadata } from "next";
import { ErrorScreen } from "@/components/ui/error-screen";
import { SiteHeader } from "./_components/header/site-header";
import { SiteFooter } from "./_components/site-footer";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <ErrorScreen
          code="404"
          message="Trang bạn tìm không tồn tại hoặc đã được chuyển đi."
        />
      </main>
      <SiteFooter />
    </>
  );
}
