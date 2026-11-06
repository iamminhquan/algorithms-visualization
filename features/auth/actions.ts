"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  GENERIC_AUTH_ERROR_MESSAGE,
  getAuthErrorMessage,
} from "./error-messages";
import { getPasswordLengthError, type IAddPasswordResult } from "./password";

export async function addPasswordAction(
  newPassword: string,
): Promise<IAddPasswordResult> {
  if (typeof newPassword !== "string") {
    return { ok: false, message: "Mật khẩu không hợp lệ." };
  }
  const lengthError = getPasswordLengthError(newPassword);
  if (lengthError !== undefined) {
    return { ok: false, message: lengthError };
  }

  try {
    await auth.api.setPassword({
      body: { newPassword },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof APIError) {
      const code = error.body?.code;
      return {
        ok: false,
        message: getAuthErrorMessage({
          code: typeof code === "string" ? code : undefined,
          status: error.statusCode,
        }),
      };
    }
    return { ok: false, message: GENERIC_AUTH_ERROR_MESSAGE };
  }
}
