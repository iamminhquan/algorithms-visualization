"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ILearningActionState,
  IStudentExamData,
  IStudentExamQuestion,
} from "../types";
import { INITIAL_LEARNING_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

const QUESTION_TYPE_LABELS = {
  multiple_choice: "Trắc nghiệm",
  fill_blank: "Điền khuyết",
  final_answer: "Kết quả cuối cùng",
} as const;

function QuestionFields({
  question,
  index,
}: {
  question: IStudentExamQuestion;
  index: number;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border-default bg-bg-surface p-5">
      <legend className="flex flex-wrap items-center gap-2 px-1">
        <span className="font-semibold text-text-primary">Câu {index + 1}</span>
        <Badge tone="neutral">{QUESTION_TYPE_LABELS[question.type]}</Badge>
        <span className="text-sm text-text-secondary">
          {question.points} điểm
        </span>
      </legend>
      <p className="whitespace-pre-wrap text-sm leading-6 text-text-primary">
        {question.content}
      </p>

      {question.type === "multiple_choice" && (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const inputId = `eq-${question.id}-option-${option.id}`;
            const isChecked =
              question.answer?.selectedOptionIds.includes(option.id) ?? false;
            return (
              <label
                key={option.id}
                htmlFor={inputId}
                className="flex items-center gap-2 rounded-lg border border-border-default px-3 py-2 text-sm text-text-primary has-checked:border-accent-default has-checked:bg-accent-subtle"
              >
                <input
                  id={inputId}
                  type={question.allowMultiple ? "checkbox" : "radio"}
                  name={`question-${question.id}`}
                  value={option.id}
                  defaultChecked={isChecked}
                />
                {option.content}
              </label>
            );
          })}
        </div>
      )}

      {question.type === "fill_blank" && (
        <div className="flex flex-col gap-3">
          {question.blankIndexes.map((blankIndex) => {
            const inputId = `eq-${question.id}-blank-${blankIndex}`;
            return (
              <div key={blankIndex} className="flex flex-col gap-1.5">
                <label
                  htmlFor={inputId}
                  className="text-sm font-medium text-text-primary"
                >
                  Chỗ trống {blankIndex}
                </label>
                <Input
                  id={inputId}
                  name={`blank-${question.id}-${blankIndex}`}
                  defaultValue={
                    question.answer?.blankValues?.[String(blankIndex)] ?? ""
                  }
                  autoComplete="off"
                />
              </div>
            );
          })}
        </div>
      )}

      {question.type === "final_answer" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`eq-${question.id}-answer`}
            className="text-sm font-medium text-text-primary"
          >
            Đáp án của bạn
          </label>
          <Input
            id={`eq-${question.id}-answer`}
            name={`answer-${question.id}`}
            defaultValue={question.answer?.textValue ?? ""}
            autoComplete="off"
          />
        </div>
      )}
    </fieldset>
  );
}

type StudentExamFormProps = {
  action: (
    state: ILearningActionState,
    formData: FormData,
  ) => Promise<ILearningActionState>;
  exam: IStudentExamData;
};

export function StudentExamForm({ action, exam }: StudentExamFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_LEARNING_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="examId" value={exam.id} />
      <div className="flex flex-col gap-5">
        {exam.questions.map((question, index) => (
          <QuestionFields key={question.id} question={question} index={index} />
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5">
        <FormMessage state={state} />
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={isPending}
            className={getButtonClassName("secondary")}
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            name="intent"
            value="submit"
            disabled={isPending}
            className={getButtonClassName("primary")}
          >
            {isPending ? "Đang xử lý..." : "Nộp bài"}
          </button>
        </div>
      </div>
    </form>
  );
}
