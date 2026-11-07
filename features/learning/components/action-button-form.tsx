"use client";

import { type FormEvent, useActionState } from "react";
import { type ButtonVariant, getButtonClassName } from "@/components/ui/button";
import type { ILearningActionState } from "../types";
import { INITIAL_LEARNING_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

type ActionButtonFormProps = {
  action: (
    state: ILearningActionState,
    formData: FormData,
  ) => Promise<ILearningActionState>;
  fields: Readonly<Record<string, string | number>>;
  label: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  className?: string;
  confirmMessage?: string;
};

export function ActionButtonForm({
  action,
  fields,
  label,
  pendingLabel = "Đang xử lý...",
  variant = "secondary",
  className,
  confirmMessage,
}: ActionButtonFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_LEARNING_ACTION_STATE,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="inline-flex flex-col gap-1"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={isPending}
        className={getButtonClassName(variant, "sm", className)}
      >
        {isPending ? pendingLabel : label}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
