import type { User } from "@/db/schema";

export type UserStatus = "active" | "invited" | "locked";

export interface IUserActionState {
  readonly error?: string;
  readonly success?: string;
}

export const INITIAL_USER_ACTION_STATE: IUserActionState = {};

export function getUserStatus(
  user: Pick<User, "emailVerified" | "isLocked">,
): UserStatus {
  if (user.isLocked) {
    return "locked";
  }
  return user.emailVerified ? "active" : "invited";
}
