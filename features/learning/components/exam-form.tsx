"use client";

import { type ReactNode, useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import type { IExamFormValues, ILearningActionState } from "../types";
import { INITIAL_LEARNING_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}`;
}

type ExamFormDialogProps = {
  action: (
    state: ILearningActionState,
    formData: FormData,
  ) => Promise<ILearningActionState>;
  title: string;
  description?: string;
  trigger: ReactNode;
  triggerLabel?: string;
  triggerClassName: string;
  submitLabel: string;
  idPrefix: string;
  initialValues: IExamFormValues;
};

export function ExamFormDialog({
  action,
  title,
  description,
  trigger,
  triggerLabel,
  triggerClassName,
  submitLabel,
  idPrefix,
  initialValues,
}: ExamFormDialogProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_LEARNING_ACTION_STATE,
  );

  return (
    <Dialog
      title={title}
      description={description}
      trigger={trigger}
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
    >
      <form action={formAction} className="flex flex-col">
        <div className="flex flex-col gap-4 px-5 py-5">
          <input type="hidden" name="classId" value={initialValues.classId} />
          {initialValues.id !== undefined && (
            <input type="hidden" name="examId" value={initialValues.id} />
          )}
          <FormField label="Tiêu đề" htmlFor={`${idPrefix}-title`}>
            <Input
              id={`${idPrefix}-title`}
              name="title"
              defaultValue={initialValues.title}
              placeholder="Ví dụ: Kiểm tra giữa kỳ"
              required
            />
          </FormField>
          <FormField label="Mô tả" htmlFor={`${idPrefix}-description`}>
            <Textarea
              id={`${idPrefix}-description`}
              name="description"
              defaultValue={initialValues.description}
              rows={3}
              placeholder="Hướng dẫn hoặc ghi chú cho sinh viên."
            />
          </FormField>
          <FormField label="Hạn nộp" htmlFor={`${idPrefix}-deadline`}>
            <Input
              id={`${idPrefix}-deadline`}
              name="deadline"
              type="datetime-local"
              defaultValue={toDateTimeLocalValue(initialValues.deadline)}
            />
          </FormField>
          <FormMessage state={state} />
        </div>
        <div className="flex justify-end gap-2 border-t border-border-default px-5 py-4">
          <button
            type="submit"
            disabled={isPending}
            className={getButtonClassName("primary")}
          >
            {isPending ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
