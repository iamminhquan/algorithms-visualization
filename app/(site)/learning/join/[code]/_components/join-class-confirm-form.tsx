"use client";

import { useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { joinClassAction } from "@/features/learning/class-actions";
import { FormMessage } from "@/features/learning/components/form-message";
import { INITIAL_LEARNING_ACTION_STATE } from "@/features/learning/types";

type JoinClassConfirmFormProps = {
  code: string;
};

export function JoinClassConfirmForm({ code }: JoinClassConfirmFormProps) {
  const [state, formAction, isPending] = useActionState(
    joinClassAction,
    INITIAL_LEARNING_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="code" value={code} />
      <button
        type="submit"
        disabled={isPending}
        className={getButtonClassName("primary")}
      >
        {isPending ? "Đang tham gia..." : "Tham gia lớp"}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
