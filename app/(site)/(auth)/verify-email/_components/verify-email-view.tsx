import { redirect } from "next/navigation";
import { REGISTER_PATH } from "@/features/auth/routes";
import { VerifyEmailForm } from "../../_components/verify-email-form";

type VerifyEmailViewProps = Pick<PageProps<"/verify-email">, "searchParams">;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function VerifyEmailView({ searchParams }: VerifyEmailViewProps) {
  const email = firstValue((await searchParams).email)?.trim();
  if (!email?.includes("@")) {
    redirect(REGISTER_PATH);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm text-text-secondary">
        Mã đã được gửi tới{" "}
        <span className="font-medium break-all text-text-primary">{email}</span>
      </p>
      <VerifyEmailForm key={email} email={email} />
    </div>
  );
}

export function VerifyEmailViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <span className="mx-auto h-5 w-56 rounded-md bg-bg-subtle" />
      <span className="h-5 w-24 rounded-md bg-bg-subtle" />
      <span className="h-11 rounded-lg bg-bg-subtle" />
      <span className="mt-2 h-11 rounded-lg bg-bg-subtle" />
      <span className="mx-auto h-5 w-40 rounded-md bg-bg-subtle" />
    </div>
  );
}
