"use client";

import { type ReactNode, useActionState, useState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AnswerMatchMode, QuestionType } from "@/db/schema";
import type {
  ILearningActionState,
  IQuestionFormValues,
  IQuestionOptionFormValue,
} from "../types";
import { INITIAL_LEARNING_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

interface IEditableOption extends IQuestionOptionFormValue {
  readonly key: string;
}

function toEditableOptions(
  values: readonly IQuestionOptionFormValue[],
): readonly IEditableOption[] {
  return values.map((option, index) => ({
    ...option,
    key: `option-${index}`,
  }));
}

function formatAnswerKeys(values: IQuestionFormValues | undefined): string {
  if (!values) {
    return "";
  }
  if (values.type === "final_answer") {
    return values.answerKeys.map((key) => key.acceptedValue).join("\n");
  }
  return values.answerKeys
    .map((key) => `${key.blankIndex}=${key.acceptedValue}`)
    .join("\n");
}

type QuestionFormDialogProps = {
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
  initialValues?: IQuestionFormValues;
};

export function QuestionFormDialog({
  action,
  title,
  description,
  trigger,
  triggerLabel,
  triggerClassName,
  submitLabel,
  idPrefix,
  initialValues,
}: QuestionFormDialogProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_LEARNING_ACTION_STATE,
  );
  const [type, setType] = useState<QuestionType>(
    initialValues?.type ?? "multiple_choice",
  );
  const [allowMultiple, setAllowMultiple] = useState(
    initialValues?.allowMultiple ?? false,
  );
  const [options, setOptions] = useState<readonly IEditableOption[]>(() =>
    toEditableOptions(
      initialValues && initialValues.options.length > 0
        ? initialValues.options
        : [
            { content: "", isCorrect: true },
            { content: "", isCorrect: false },
          ],
    ),
  );
  const [answerKeysText, setAnswerKeysText] = useState(() =>
    formatAnswerKeys(initialValues),
  );
  const [matchMode, setMatchMode] = useState<AnswerMatchMode>(
    initialValues?.answerKeys[0]?.matchMode ?? "exact",
  );

  function updateOption(
    index: number,
    value: Partial<IQuestionOptionFormValue>,
  ) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...value } : option,
      ),
    );
  }

  function setCorrect(index: number, checked: boolean) {
    setOptions((current) =>
      current.map((option, optionIndex) => {
        if (optionIndex === index) {
          return { ...option, isCorrect: checked };
        }
        if (allowMultiple) {
          return option;
        }
        return checked ? { ...option, isCorrect: false } : option;
      }),
    );
  }

  function toggleAllowMultiple(checked: boolean) {
    setAllowMultiple(checked);
    if (checked) {
      return;
    }
    setOptions((current) => {
      let foundCorrect = false;
      return current.map((option) => {
        if (!option.isCorrect) {
          return option;
        }
        if (foundCorrect) {
          return { ...option, isCorrect: false };
        }
        foundCorrect = true;
        return option;
      });
    });
  }

  return (
    <Dialog
      title={title}
      description={description}
      trigger={trigger}
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
      size="lg"
    >
      <form action={formAction} className="flex flex-col">
        <div className="flex flex-col gap-4 px-5 py-5">
          {initialValues?.id !== undefined && (
            <input type="hidden" name="questionId" value={initialValues.id} />
          )}
          <FormField label="Loại câu hỏi" htmlFor={`${idPrefix}-type`}>
            <Select
              id={`${idPrefix}-type`}
              name="type"
              value={type}
              onChange={(event) => setType(event.target.value as QuestionType)}
            >
              <option value="multiple_choice">Trắc nghiệm</option>
              <option value="fill_blank">Điền khuyết</option>
              <option value="final_answer">Điền kết quả cuối cùng</option>
            </Select>
          </FormField>
          <FormField
            label="Nội dung câu hỏi"
            htmlFor={`${idPrefix}-content`}
            hint={
              type === "fill_blank"
                ? "Dùng {{1}}, {{2}}... để đánh dấu chỗ trống."
                : undefined
            }
          >
            <Textarea
              id={`${idPrefix}-content`}
              name="content"
              defaultValue={initialValues?.content}
              placeholder={
                type === "fill_blank"
                  ? "Ví dụ: Độ phức tạp của Bubble Sort là {{1}}."
                  : "Nhập nội dung câu hỏi"
              }
              rows={3}
              required
            />
          </FormField>

          {type === "multiple_choice" ? (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  name="allowMultiple"
                  checked={allowMultiple}
                  onChange={(event) =>
                    toggleAllowMultiple(event.target.checked)
                  }
                />
                Cho phép chọn nhiều đáp án
              </label>
              <div className="flex flex-col gap-2">
                {options.map((option, index) => (
                  <div
                    key={option.key}
                    className="flex items-center gap-2 rounded-lg border border-border-default p-2"
                  >
                    <input
                      type="checkbox"
                      name={`correct-${index}`}
                      checked={option.isCorrect}
                      aria-label={`Đáp án đúng ${index + 1}`}
                      onChange={(event) =>
                        setCorrect(index, event.target.checked)
                      }
                    />
                    <Input
                      name={`option-${index}`}
                      value={option.content}
                      aria-label={`Lựa chọn ${index + 1}`}
                      placeholder={`Lựa chọn ${index + 1}`}
                      onChange={(event) =>
                        updateOption(index, { content: event.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className={getButtonClassName("ghost", "sm")}
                      onClick={() =>
                        setOptions((current) =>
                          current.filter(
                            (_, optionIndex) => optionIndex !== index,
                          ),
                        )
                      }
                      disabled={options.length <= 2}
                    >
                      Bỏ
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={getButtonClassName("secondary", "sm", "self-start")}
                onClick={() =>
                  setOptions((current) => [
                    ...current,
                    {
                      content: "",
                      isCorrect: false,
                      key: `option-new-${Date.now()}-${current.length}`,
                    },
                  ])
                }
                disabled={options.length >= 8}
              >
                Thêm lựa chọn
              </button>
            </div>
          ) : (
            <>
              <FormField
                label="Đáp án chấp nhận"
                htmlFor={`${idPrefix}-answers`}
                hint={
                  type === "fill_blank"
                    ? "Mỗi dòng một đáp án, dạng 1=đáp án. Ví dụ: 1=O(n²)."
                    : "Mỗi dòng một đáp án chấp nhận."
                }
              >
                <Textarea
                  id={`${idPrefix}-answers`}
                  name="answerKeys"
                  value={answerKeysText}
                  onChange={(event) => setAnswerKeysText(event.target.value)}
                  rows={4}
                  required
                />
              </FormField>
              <FormField
                label="Cách so khớp"
                htmlFor={`${idPrefix}-match-mode`}
              >
                <Select
                  id={`${idPrefix}-match-mode`}
                  name="matchMode"
                  value={matchMode}
                  onChange={(event) =>
                    setMatchMode(event.target.value as AnswerMatchMode)
                  }
                >
                  <option value="exact">Chính xác</option>
                  <option value="case_insensitive">
                    Không phân biệt hoa thường
                  </option>
                  <option value="numeric">So sánh số</option>
                </Select>
              </FormField>
            </>
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
