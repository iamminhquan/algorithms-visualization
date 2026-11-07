"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { User } from "@/db/schema";
import type { IUserActionState, UserStatus } from "@/features/auth/user-types";
import { INITIAL_USER_ACTION_STATE } from "@/features/auth/user-types";
import { UserActionMessage } from "./user-action-message";
import { UserFormFields } from "./user-form-fields";

type UserFormDialogProps = {
  action: (
    state: IUserActionState,
    formData: FormData,
  ) => Promise<IUserActionState>;
  mode: "invite" | "edit";
  trigger: ReactNode;
  triggerLabel?: string;
  triggerClassName: string;
  idPrefix: string;
  user?: Pick<User, "id" | "name" | "email" | "role">;
  status?: UserStatus;
};

const DIALOG_CONTENT = {
  invite: {
    title: "Thêm người dùng",
    description:
      "Admin đặt mật khẩu ban đầu; người dùng đăng nhập ngay bằng email và mật khẩu này.",
    submitLabel: "Tạo tài khoản",
  },
  edit: {
    title: "Sửa người dùng",
    description:
      "Cập nhật tên, vai trò, trạng thái hoặc đặt lại mật khẩu cho tài khoản.",
    submitLabel: "Lưu thay đổi",
  },
} as const;

export function UserFormDialog({
  action,
  mode,
  trigger,
  triggerLabel,
  triggerClassName,
  idPrefix,
  user,
  status,
}: UserFormDialogProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_USER_ACTION_STATE,
  );
  const content = DIALOG_CONTENT[mode];

  return (
    <Dialog
      title={content.title}
      description={content.description}
      trigger={trigger}
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
    >
      <form action={formAction} className="flex flex-col">
        <div className="flex flex-col gap-4 px-5 py-5">
          {user !== undefined && (
            <input type="hidden" name="userId" value={user.id} />
          )}
          <UserFormFields idPrefix={idPrefix} user={user} status={status} />
          <UserActionMessage state={state} />
        </div>
        <div className="flex justify-end gap-2 border-t border-border-default px-5 py-4">
          <button
            type="submit"
            disabled={isPending}
            className={getButtonClassName("primary")}
          >
            {isPending ? "Đang lưu..." : content.submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
