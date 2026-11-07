import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = new Set(["admin", "teacher"]);

export async function AdminRoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user?.role;

  if (!session?.user || !role || !ADMIN_ROLES.has(role)) {
    forbidden();
  }

  return <>{children}</>;
}
