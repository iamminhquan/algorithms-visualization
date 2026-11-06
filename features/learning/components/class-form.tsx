"use client";

import { type ReactNode, useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ILearningActionState } from "../types";
import { INITIAL_LEARNING_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

type TeacherOption = {
  readonly id: string;
  readonly name: string;
};

type ClassFormValues = {
  readonly name: string;
  readonly minSize: number;
  readonly maxSize: number;
  readonly ownerId: string;
};

type ClassFormDialogProps = {
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
  teachers: readonly TeacherOption[];
  isAdmin: boolean;
  initialValues?: ClassFormValues;
  classId?: number;
};

export function ClassFormDialog({
  action,
  title,
  description,
  trigger,
  triggerLabel,
  triggerClassName,
  submitLabel,
  idPrefix,
  teachers,
  isAdmin,
  initialValues,
  classId,
}: ClassFormDialogProps) {
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
          {classId !== undefined && (
            <input type="hidden" name="classId" value={classId} />
          )}
          <FormField label="Tên lớp" htmlFor={`${idPrefix}-name`}>
            <Input
              id={`${idPrefix}-name`}
              name="name"
              defaultValue={initialValues?.name}
              placeholder="Ví dụ: Cấu trúc dữ liệu và giải thuật – K24"
              required
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Sĩ số tối thiểu" htmlFor={`${idPrefix}-min`}>
              <Input
                id={`${idPrefix}-min`}
                name="minSize"
                type="number"
                min={0}
                defaultValue={initialValues?.minSize ?? 0}
                required
              />
            </FormField>
            <FormField label="Sĩ số tối đa" htmlFor={`${idPrefix}-max`}>
              <Input
                id={`${idPrefix}-max`}
                name="maxSize"
                type="number"
                min={1}
                defaultValue={initialValues?.maxSize ?? 50}
                required
              />
            </FormField>
          </div>
          {isAdmin && (
            <FormField
              label="Giảng viên phụ trách"
              htmlFor={`${idPrefix}-owner`}
            >
              <Select
                id={`${idPrefix}-owner`}
                name="ownerId"
                defaultValue={initialValues?.ownerId ?? ""}
              >
                <option value="">Chọn giảng viên</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
          {classId === undefined && (
            <p className="text-xs text-text-muted">
              Mã lớp sẽ được tạo tự động sau khi mở lớp.
            </p>
          )}
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
