"use client";

import Link from "next/link";
import { useActionState } from "react";
import { getButtonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getAdminQuestionsHref } from "../routes";
import type { ILearningActionState } from "../types";
import { INITIAL_LEARNING_ACTION_STATE } from "../types";
import { FormMessage } from "./form-message";

type QuestionOption = {
  readonly id: number;
  readonly content: string;
  readonly type: string;
};

type AddExamQuestionFormProps = {
  action: (
    state: ILearningActionState,
    formData: FormData,
  ) => Promise<ILearningActionState>;
  examId: number;
  questions: readonly QuestionOption[];
  /** Tổng số câu trong ngân hàng, dùng để phân biệt "ngân hàng trống" với "đã thêm hết". */
  bankCount: number;
};

export function AddExamQuestionForm({
  action,
  examId,
  questions,
  bankCount,
}: AddExamQuestionFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_LEARNING_ACTION_STATE,
  );

  if (questions.length === 0) {
    return (
      <div className="flex flex-col gap-1 px-5 py-6">
        <p className="text-sm text-text-secondary">
          {bankCount === 0
            ? "Ngân hàng câu hỏi đang trống. Hãy tạo câu hỏi trong ngân hàng câu hỏi trước."
            : "Tất cả câu hỏi trong ngân hàng đã có trong đề này. Import thêm câu hỏi nếu cần."}
        </p>
        <Link
          href={getAdminQuestionsHref()}
          className="self-start text-sm font-medium text-accent-text hover:underline"
        >
          Quản lý ngân hàng câu hỏi
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 px-5 py-5">
      <input type="hidden" name="examId" value={examId} />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`exam-${examId}-question`}
          className="text-sm font-medium text-text-primary"
        >
          Câu hỏi
        </label>
        <Select
          id={`exam-${examId}-question`}
          name="questionId"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Chọn câu hỏi từ ngân hàng
          </option>
          {questions.map((question) => (
            <option key={question.id} value={question.id}>
              {question.content.slice(0, 80)}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={getButtonClassName("primary")}
        >
          {isPending ? "Đang thêm..." : "Thêm câu hỏi"}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
