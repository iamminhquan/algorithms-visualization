import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/features/auth/routes";
import { ResetPasswordForm } from "./reset-password-form";

type ResetPasswordViewProps = Pick<
  PageProps<"/reset-password">,
  "searchParams"
>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function ResetPasswordView({
  searchParams,
}: ResetPasswordViewProps) {
  const email = firstValue((await searchParams).email)?.trim();
  if (!email?.includes("@")) {
    redirect(LOGIN_PATH);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm text-text-secondary">
        Nhập mã đã gửi tới{" "}
        <span className="font-medium break-all text-text-primary">{email}</span>{" "}
        và đặt mật khẩu mới.
      </p>
      <ResetPasswordForm key={email} email={email} />
    </div>
  );
}

export function ResetPasswordViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <span className="mx-auto h-5 w-64 rounded-md bg-bg-subtle" />
      <span className="h-5 w-24 rounded-md bg-bg-subtle" />
      <span className="h-11 rounded-lg bg-bg-subtle" />
      <span className="h-11 rounded-lg bg-bg-subtle" />
      <span className="mt-2 h-11 rounded-lg bg-bg-subtle" />
      <span className="mx-auto h-5 w-40 rounded-md bg-bg-subtle" />
    </div>
  );
}
