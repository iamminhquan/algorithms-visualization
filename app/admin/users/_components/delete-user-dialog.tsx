"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { IUserActionState } from "@/features/auth/user-types";
import { INITIAL_USER_ACTION_STATE } from "@/features/auth/user-types";
import { UserActionMessage } from "./user-action-message";

type DeleteUserDialogProps = {
  action: (
    state: IUserActionState,
    formData: FormData,
  ) => Promise<IUserActionState>;
  userId: string;
  userName: string;
};

export function DeleteUserDialog({
  action,
  userId,
  userName,
}: DeleteUserDialogProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_USER_ACTION_STATE,
  );

  return (
    <Dialog
      title="Xoá người dùng?"
      trigger={<Trash2 aria-hidden="true" />}
      triggerLabel={`Xoá người dùng ${userName}`}
      triggerClassName={getButtonClassName(
        "ghost",
        "icon",
        "hover:bg-danger-subtle hover:text-danger-text",
      )}
      size="sm"
    >
      <form action={formAction} className="flex flex-col">
        <div className="flex flex-col gap-3 px-5 py-5">
          <p className="text-sm leading-6 text-text-secondary">
            Bạn có chắc muốn xoá người dùng{" "}
            <strong className="font-semibold text-text-primary">
              “{userName}”
            </strong>
            ? Thao tác này không thể hoàn tác.
          </p>
          <UserActionMessage state={state} />
        </div>
        <input type="hidden" name="userId" value={userId} />
        <div className="flex justify-end gap-2 border-t border-border-default px-5 py-4">
          <button
            type="submit"
            disabled={isPending}
            className={getButtonClassName("danger")}
          >
            {isPending ? "Đang xoá..." : "Xoá"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
