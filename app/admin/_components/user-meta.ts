import type { BadgeTone } from "@/components/ui/badge";
import type { UserRole } from "@/db/schema";

interface IStatusOption {
  readonly label: string;
  readonly tone: BadgeTone;
}

export type UserStatus = "active" | "invited" | "locked";

export const USER_ROLES: Readonly<Record<UserRole, IStatusOption>> = {
  admin: { label: "Quản trị", tone: "accent" },
  teacher: { label: "Giáo viên", tone: "neutral" },
  student: { label: "Học viên", tone: "neutral" },
};

export const USER_STATUSES: Readonly<Record<UserStatus, IStatusOption>> = {
  active: { label: "Đang hoạt động", tone: "success" },
  invited: { label: "Chờ kích hoạt", tone: "warning" },
  locked: { label: "Đã khoá", tone: "danger" },
};
