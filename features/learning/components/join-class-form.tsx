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
      className="flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-bg-surface px-4 py-3"
    >
      <label
        htmlFor="join-class-code"
        className="text-sm font-medium whitespace-nowrap text-text-primary"
      >
        Tham gia lớp học
      </label>
      <Input
        id="join-class-code"
        name="code"
        placeholder="Ví dụ: AB12CD"
        autoComplete="off"
        className="w-44 font-mono uppercase"
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className={getButtonClassName("primary", "sm")}
      >
        {isPending ? "Đang tham gia..." : "Tham gia"}
      </button>
      {state.error || state.success ? (
        <div className="w-full">
          <FormMessage state={state} />
        </div>
      ) : null}
    </form>
  );
}
