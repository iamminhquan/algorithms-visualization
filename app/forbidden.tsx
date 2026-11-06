import { ErrorScreen } from "@/components/ui/error-screen";
import { SiteHeader } from "./_components/header/site-header";
import { SiteFooter } from "./_components/site-footer";

export default function Forbidden() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <ErrorScreen
          code="403"
          message="Bạn không có quyền truy cập trang này."
        />
      </main>
      <SiteFooter />
    </>
  );
}
