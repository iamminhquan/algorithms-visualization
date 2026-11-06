"use server";

import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import {
  accountsTable,
  sessionsTable,
  USER_ROLE_VALUES,
  type UserRole,
  usersTable,
} from "@/db/schema";
import { requireAdminUser } from "@/features/learning/auth";
import { getNewPasswordError } from "./password";
import { USERS_CACHE_TAG } from "./queries";
import type { IUserActionState, UserStatus } from "./user-types";

const MAX_NAME_LENGTH = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION_CODE = "23505";
const FOREIGN_KEY_VIOLATION_CODE = "23503";

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isUserRole(value: string): value is UserRole {
  return USER_ROLE_VALUES.some((role) => role === value);
}

function isUserStatus(value: string): value is UserStatus {
  return value === "active" || value === "invited" || value === "locked";
}

function actionError(message: string): IUserActionState {
  return { error: message };
}

function actionSuccess(message: string): IUserActionState {
  return { success: message };
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }
  if ("cause" in error) {
    return getErrorCode(error.cause);
  }
  return undefined;
}

function getUnknownErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

function validateName(name: string): string | undefined {
  if (name === "") {
    return "Họ và tên không được để trống.";
  }
  if (name.length > MAX_NAME_LENGTH) {
    return `Họ và tên không được dài quá ${MAX_NAME_LENGTH} ký tự.`;
  }
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (!EMAIL_PATTERN.test(email)) {
    return "Email không hợp lệ.";
  }
  return undefined;
}

async function hasAnotherAdmin(userId: string): Promise<boolean> {
  const admin = await db.query.usersTable.findFirst({
    where: and(
      eq(usersTable.role, "admin"),
      ne(usersTable.id, userId),
      eq(usersTable.isLocked, false),
    ),
    columns: { id: true },
  });
  return admin !== undefined;
}

export async function createUserAction(
  _previousState: IUserActionState,
  formData: FormData,
): Promise<IUserActionState> {
  await requireAdminUser();
  const name = getFormText(formData, "name");
  const email = getFormText(formData, "email").toLowerCase();
  const role = getFormText(formData, "role");
  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");

  const nameError = validateName(name);
  if (nameError) {
    return actionError(nameError);
  }
  const emailError = validateEmail(email);
  if (emailError) {
    return actionError(emailError);
  }
  if (!isUserRole(role)) {
    return actionError("Vai trò không hợp lệ.");
  }
  if (typeof password !== "string" || typeof passwordConfirm !== "string") {
    return actionError("Mật khẩu không hợp lệ.");
  }
  const passwordError = getNewPasswordError(password, passwordConfirm);
  if (passwordError) {
    return actionError(passwordError);
  }

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
    columns: { id: true },
  });
  if (existing) {
    return actionError("Email này đã được sử dụng.");
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(password);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: userId,
        name,
        email,
        role,
        emailVerified: true,
        isLocked: false,
      });
      await tx.insert(accountsTable).values({
        id: randomUUID(),
        userId,
        accountId: userId,
        providerId: "credential",
        password: passwordHash,
      });
    });
  } catch (error) {
    if (getErrorCode(error) === UNIQUE_VIOLATION_CODE) {
      return actionError("Email này đã được sử dụng.");
    }
    return actionError(getUnknownErrorMessage(error));
  }

  updateTag(USERS_CACHE_TAG);
  return actionSuccess(
    `Đã tạo tài khoản ${email}. Giảng viên có thể đăng nhập bằng mật khẩu này.`,
  );
}

export async function updateUserAction(
  _previousState: IUserActionState,
  formData: FormData,
): Promise<IUserActionState> {
  const actor = await requireAdminUser();
  const userId = getFormText(formData, "userId");
  const name = getFormText(formData, "name");
  const role = getFormText(formData, "role");
  const status = getFormText(formData, "status");

  if (userId === "") {
    return actionError("Người dùng không hợp lệ.");
  }
  const nameError = validateName(name);
  if (nameError) {
    return actionError(nameError);
  }
  if (!isUserRole(role)) {
    return actionError("Vai trò không hợp lệ.");
  }
  if (!isUserStatus(status)) {
    return actionError("Trạng thái không hợp lệ.");
  }

  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");
  const hasPasswordInput =
    (typeof password === "string" && password !== "") ||
    (typeof passwordConfirm === "string" && passwordConfirm !== "");
  let passwordHash: string | undefined;
  if (hasPasswordInput) {
    if (typeof password !== "string" || typeof passwordConfirm !== "string") {
      return actionError("Mật khẩu không hợp lệ.");
    }
    const passwordError = getNewPasswordError(password, passwordConfirm);
    if (passwordError) {
      return actionError(passwordError);
    }
    passwordHash = await hashPassword(password);
  }

  const target = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      id: true,
      role: true,
      emailVerified: true,
      isLocked: true,
    },
  });
  if (!target) {
    return actionError("Không tìm thấy người dùng.");
  }
  if (target.id === actor.id && (role !== "admin" || status !== "active")) {
    return actionError(
      "Bạn không thể đổi vai trò hoặc khoá tài khoản của mình.",
    );
  }
  const losesAdmin =
    target.role === "admin" && (role !== "admin" || status === "locked");
  if (losesAdmin && !(await hasAnotherAdmin(target.id))) {
    return actionError(
      "Hệ thống cần ít nhất một quản trị viên đang hoạt động.",
    );
  }

  const nextIsLocked = status === "locked";
  const nextEmailVerified = passwordHash
    ? true
    : status === "active"
      ? true
      : status === "invited"
        ? false
        : target.emailVerified;

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({
          name,
          role,
          isLocked: nextIsLocked,
          emailVerified: nextEmailVerified,
        })
        .where(eq(usersTable.id, userId));

      if (passwordHash !== undefined) {
        const hash = passwordHash;
        const credentialAccount = await tx
          .select({ id: accountsTable.id })
          .from(accountsTable)
          .where(
            and(
              eq(accountsTable.userId, userId),
              eq(accountsTable.providerId, "credential"),
            ),
          )
          .limit(1);

        if (credentialAccount[0]) {
          await tx
            .update(accountsTable)
            .set({ password: hash })
            .where(eq(accountsTable.id, credentialAccount[0].id));
        } else {
          await tx.insert(accountsTable).values({
            id: randomUUID(),
            userId,
            accountId: userId,
            providerId: "credential",
            password: hash,
          });
        }
      }
    });

    if (nextIsLocked && !target.isLocked) {
      await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
    }
  } catch (error) {
    return actionError(getUnknownErrorMessage(error));
  }

  updateTag(USERS_CACHE_TAG);
  return actionSuccess("Đã cập nhật người dùng.");
}

export async function deleteUserAction(
  _previousState: IUserActionState,
  formData: FormData,
): Promise<IUserActionState> {
  const actor = await requireAdminUser();
  const userId = getFormText(formData, "userId");

  if (userId === "") {
    return actionError("Người dùng không hợp lệ.");
  }
  if (userId === actor.id) {
    return actionError("Bạn không thể xoá tài khoản của mình.");
  }

  const target = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: { id: true, role: true },
  });
  if (!target) {
    return actionError("Không tìm thấy người dùng.");
  }
  if (target.role === "admin" && !(await hasAnotherAdmin(target.id))) {
    return actionError(
      "Hệ thống cần ít nhất một quản trị viên đang hoạt động.",
    );
  }

  try {
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  } catch (error) {
    if (getErrorCode(error) === FOREIGN_KEY_VIOLATION_CODE) {
      return actionError(
        "Không thể xoá vì người dùng đang gắn với lớp học, câu hỏi hoặc bài kiểm tra.",
      );
    }
    return actionError(getUnknownErrorMessage(error));
  }

  updateTag(USERS_CACHE_TAG);
  return actionSuccess("Đã xoá người dùng.");
}
