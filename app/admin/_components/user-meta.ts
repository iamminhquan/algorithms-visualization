import type { BadgeTone } from "@/components/ui/badge";
import type { UserRole } from "@/db/schema";
import type { UserStatus } from "@/features/auth/user-types";

export type { UserStatus } from "@/features/auth/user-types";

interface IStatusOption {
  readonly label: string;
  readonly tone: BadgeTone;
}

export const USER_ROLES: Readonly<Record<UserRole, IStatusOption>> = {
  admin: { label: "Quản trị", tone: "accent" },
  teacher: { label: "Giảng viên", tone: "neutral" },
  student: { label: "Học viên", tone: "neutral" },
};

export const USER_STATUSES: Readonly<Record<UserStatus, IStatusOption>> = {
  active: { label: "Đang hoạt động", tone: "success" },
  invited: { label: "Chờ kích hoạt", tone: "warning" },
  locked: { label: "Đã khoá", tone: "danger" },
};
