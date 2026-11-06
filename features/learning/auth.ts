import "server-only";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import type { UserRole } from "@/db/schema";
import { LOGIN_PATH } from "@/features/auth/routes";
import { auth } from "@/lib/auth";

export interface ILearningUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

export async function getLearningUser(): Promise<ILearningUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) {
    return null;
  }
  if (
    user.role !== "admin" &&
    user.role !== "teacher" &&
    user.role !== "student"
  ) {
    return null;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function requireLearningUser(): Promise<ILearningUser> {
  const user = await getLearningUser();
  if (!user) {
    redirect(LOGIN_PATH);
  }
  return user;
}

export async function requireStaffUser(): Promise<ILearningUser> {
  const user = await requireLearningUser();
  if (user.role !== "admin" && user.role !== "teacher") {
    forbidden();
  }
  return user;
}

export async function requireStudentUser(): Promise<ILearningUser> {
  const user = await requireLearningUser();
  if (user.role !== "student") {
    forbidden();
  }
  return user;
}

export function canManageClass(user: ILearningUser, ownerId: string): boolean {
  return user.role === "admin" || user.id === ownerId;
}
