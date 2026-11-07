"use client";

import { useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ILearningActionState } from "../types";
import { INITIAL_LEARNING_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

type JoinClassFormProps = {
  action: (
    state: ILearningActionState,
    formData: FormData,
  ) => Promise<ILearningActionState>;
};

export function JoinClassForm({ action }: JoinClassFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_LEARNING_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-text-primary">
          Tham gia lớp học
        </h2>
        <p className="text-sm text-text-secondary">
          Nhập mã lớp do giảng viên cung cấp để tham gia.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="code"
          aria-label="Mã lớp"
          placeholder="Ví dụ: AB12CD"
          autoComplete="off"
          className="font-mono uppercase sm:max-w-56"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className={getButtonClassName("primary")}
        >
          {isPending ? "Đang tham gia..." : "Tham gia"}
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
