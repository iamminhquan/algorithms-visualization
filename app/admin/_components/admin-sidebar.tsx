import { Suspense } from "react";
import { AdminBrand, BackToSiteLink } from "./admin-brand";
import { AdminNav, CurrentAdminNav } from "./admin-nav";

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border-default bg-bg-surface lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-border-default px-5">
        <AdminBrand />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <Suspense fallback={<AdminNav pathname={null} />}>
          <CurrentAdminNav />
        </Suspense>
      </div>
      <div className="shrink-0 border-t border-border-default p-3">
        <BackToSiteLink />
      </div>
    </aside>
  );
}
