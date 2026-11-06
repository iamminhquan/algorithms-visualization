import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LOGIN_PATH } from "@/features/auth/routes";
import { auth } from "@/lib/auth";
import { PasswordSection } from "./password-section";

export async function ProfileView() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    redirect(LOGIN_PATH);
  }

  const accounts = await auth.api.listUserAccounts({
    headers: requestHeaders,
  });
  const hasGoogle = accounts.some((account) => account.providerId === "google");
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Hồ sơ của bạn
        </h1>
        <p className="max-w-160 text-lg leading-7.5 text-text-secondary">
          Quản lý thông tin tài khoản và các cách đăng nhập.
        </p>
      </header>

      <section className="rounded-2xl border border-border-default bg-bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Thông tin tài khoản
        </h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-text-secondary">Họ và tên</dt>
            <dd className="font-medium text-text-primary">
              {session.user.name}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-text-secondary">Email</dt>
            <dd className="font-medium break-all text-text-primary">
              {session.user.email}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-text-secondary">Trạng thái email</dt>
            <dd>
              <Badge tone={session.user.emailVerified ? "success" : "warning"}>
                {session.user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
              </Badge>
            </dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border-default bg-bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-text-primary">
            Phương thức đăng nhập
          </h2>
          <p className="text-sm leading-5.5 text-text-secondary">
            Bạn có thể dùng nhiều cách đăng nhập cho cùng một tài khoản.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {hasGoogle ? (
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border-default bg-bg-subtle p-4">
              <div className="min-w-0">
                <p className="font-medium text-text-primary">Google</p>
                <p className="mt-1 text-sm leading-5.5 text-text-secondary">
                  Tài khoản Google đã được liên kết với hồ sơ này.
                </p>
              </div>
              <Badge tone="success">Đã liên kết</Badge>
            </div>
          ) : null}
          <PasswordSection hasPassword={hasPassword} hasGoogle={hasGoogle} />
        </div>
      </section>
    </div>
  );
}

export function ProfileViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="h-10 w-64 max-w-full rounded-lg bg-bg-subtle" />
        <div className="h-5 w-80 max-w-full rounded bg-bg-subtle" />
      </div>
      <div className="h-44 rounded-2xl bg-bg-subtle" />
      <div className="h-72 rounded-2xl bg-bg-subtle" />
    </div>
  );
}
