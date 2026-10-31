import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminTopbar } from "./_components/admin-topbar";

export const metadata: Metadata = {
  title: {
    default: `Quản trị | ${SITE_NAME}`,
    template: `%s – Quản trị | ${SITE_NAME}`,
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex flex-1 flex-col px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
