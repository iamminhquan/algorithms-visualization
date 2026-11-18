"use client";

import { Check, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { getCorrectAnswerText, gradeQuizResponse } from "../quiz/grading";
import type { IQuizQuestion, IQuizResponse } from "../quiz/types";

const LONG_OPTION_LENGTH = 70;

const OPTION_BASE_CLASS =
  "flex min-h-12 items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors";
const OPTION_IDLE_CLASS =
  "border-border-default bg-bg-page text-text-primary hover:border-border-strong";
const OPTION_SELECTED_CLASS =
  "border-accent-default bg-accent-subtle text-text-primary";
const OPTION_CORRECT_CLASS =
  "border-emerald-700 bg-success-subtle text-success-text";
const OPTION_WRONG_CLASS =
  "border-danger-default bg-danger-subtle text-danger-text";
const OPTION_MUTED_CLASS =
  "border-border-default bg-bg-page text-text-secondary";

interface IQuizAnswerRecord {
  readonly questionId: string;
  readonly isCorrect: boolean;
  readonly response: IQuizResponse;
}

type AlgorithmQuizViewProps = {
  readonly questions: readonly IQuizQuestion[];
};

type QuizQuestionCardProps = {
  readonly question: IQuizQuestion;
  readonly index: number;
  readonly total: number;
  readonly onNext: (result: IQuizAnswerRecord) => void;
};

type AlgorithmQuizSummaryProps = {
  readonly questions: readonly IQuizQuestion[];
  readonly results: readonly IQuizAnswerRecord[];
};

function getOptionClassName(
  isSelected: boolean,
  isChecked: boolean,
  isCorrectOption: boolean,
): string {
  if (isChecked) {
    if (isCorrectOption) {
      return OPTION_CORRECT_CLASS;
    }
    if (isSelected) {
      return OPTION_WRONG_CLASS;
    }
    return OPTION_MUTED_CLASS;
  }
  return isSelected ? OPTION_SELECTED_CLASS : OPTION_IDLE_CLASS;
}

function buildResponse(
  question: IQuizQuestion,
  selectedOptionIds: readonly string[],
  booleanValue: boolean | null,
  textValue: string,
): IQuizResponse | null {
  switch (question.type) {
    case "single_choice":
      return selectedOptionIds.length === 1
        ? { type: "single_choice", optionId: selectedOptionIds[0] }
        : null;
    case "multiple_choice":
      return selectedOptionIds.length > 0
        ? { type: "multiple_choice", optionIds: selectedOptionIds }
        : null;
    case "true_false":
      return booleanValue === null
        ? null
        : { type: "true_false", value: booleanValue };
    case "fill_blank":
      return textValue.trim() === ""
        ? null
        : { type: "fill_blank", value: textValue };
    default: {
      const unreachable: never = question;
      throw new Error(
        `Dạng câu hỏi không hợp lệ: ${JSON.stringify(unreachable)}`,
      );
    }
  }
}

function QuizQuestionCard({
  question,
  index,
  total,
  onNext,
}: QuizQuestionCardProps) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<readonly string[]>(
    [],
  );
  const [booleanValue, setBooleanValue] = useState<boolean | null>(null);
  const [textValue, setTextValue] = useState("");
  const [submittedResponse, setSubmittedResponse] =
    useState<IQuizResponse | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasAdvancedRef = useRef(false);

  const isChecked = submittedResponse !== null;
  const isCorrect =
    submittedResponse !== null &&
    gradeQuizResponse(question, submittedResponse);
  const response = buildResponse(
    question,
    selectedOptionIds,
    booleanValue,
    textValue,
  );
  const isLastQuestion = index + 1 >= total;
  const completedCount = index + (isChecked ? 1 : 0);
  const progressPercent =
    total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const hasLongOption =
    (question.type === "single_choice" ||
      question.type === "multiple_choice") &&
    question.options.some((option) => option.text.length > LONG_OPTION_LENGTH);

  useEffect(() => {
    if (index > 0) {
      headingRef.current?.focus();
    }
  }, [index]);

  function handleOptionChange(optionId: string) {
    if (question.type === "multiple_choice") {
      setSelectedOptionIds((previous) =>
        previous.includes(optionId)
          ? previous.filter((id) => id !== optionId)
          : [...previous, optionId],
      );
      return;
    }
    setSelectedOptionIds([optionId]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isChecked) {
      if (hasAdvancedRef.current || submittedResponse === null) {
        return;
      }
      hasAdvancedRef.current = true;
      onNext({
        questionId: question.id,
        isCorrect,
        response: submittedResponse,
      });
      return;
    }
    if (response === null) {
      return;
    }
    setSubmittedResponse(response);
  }

  return (
    <section
      aria-label="Kiểm tra hiểu bài"
      className="scroll-mt-6 rounded-2xl border border-border-default bg-bg-surface p-5 shadow-sm sm:p-7"
    >
      <header className="flex flex-wrap items-start gap-3">
        <div>
          <p className="text-sm font-medium text-accent-text">
            Kiểm tra hiểu bài
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-xl font-semibold tracking-tight text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-default"
          >
            Câu {index + 1}/{total}
          </h2>
        </div>
      </header>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg-subtle"
        role="progressbar"
        aria-label="Tiến độ làm bài"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completedCount}
      >
        <div
          className="h-full rounded-full bg-accent-default transition-[width]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-5">
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-4 text-base font-medium leading-6 text-text-primary">
            {question.prompt}
          </legend>

          {question.type === "single_choice" ||
          question.type === "multiple_choice" ? (
            <div
              className={cn("grid gap-2", !hasLongOption && "sm:grid-cols-2")}
            >
              {question.options.map((option) => {
                const isSelected = selectedOptionIds.includes(option.id);
                return (
                  <label
                    key={option.id}
                    htmlFor={`${question.id}-${option.id}`}
                    className={cn(
                      OPTION_BASE_CLASS,
                      getOptionClassName(
                        isSelected,
                        isChecked,
                        option.isCorrect,
                      ),
                      isChecked && "cursor-default",
                    )}
                  >
                    <input
                      id={`${question.id}-${option.id}`}
                      type={
                        question.type === "multiple_choice"
                          ? "checkbox"
                          : "radio"
                      }
                      name={question.id}
                      value={option.id}
                      checked={isSelected}
                      disabled={isChecked}
                      onChange={() => handleOptionChange(option.id)}
                      className="mt-0.5 size-4 shrink-0 accent-accent-default"
                    />
                    <span className="flex-1">{option.text}</span>
                    {isChecked && option.isCorrect ? (
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                    ) : null}
                    {isChecked && isSelected && !option.isCorrect ? (
                      <X
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                    ) : null}
                  </label>
                );
              })}
            </div>
          ) : null}

          {question.type === "true_false" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {[true, false].map((value) => {
                const isSelected = booleanValue === value;
                const isCorrectOption = question.answer === value;
                return (
                  <label
                    key={value ? "true" : "false"}
                    htmlFor={`${question.id}-${value ? "true" : "false"}`}
                    className={cn(
                      OPTION_BASE_CLASS,
                      getOptionClassName(
                        isSelected,
                        isChecked,
                        isCorrectOption,
                      ),
                      isChecked && "cursor-default",
                    )}
                  >
                    <input
                      id={`${question.id}-${value ? "true" : "false"}`}
                      type="radio"
                      name={question.id}
                      checked={isSelected}
                      disabled={isChecked}
                      onChange={() => setBooleanValue(value)}
                      className="mt-0.5 size-4 shrink-0 accent-accent-default"
                    />
                    <span className="flex-1">{value ? "Đúng" : "Sai"}</span>
                    {isChecked && isCorrectOption ? (
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                    ) : null}
                    {isChecked && isSelected && !isCorrectOption ? (
                      <X
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                    ) : null}
                  </label>
                );
              })}
            </div>
          ) : null}

          {question.type === "fill_blank" ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor={`${question.id}-answer`}
                className="text-sm font-medium text-text-primary"
              >
                Đáp án của bạn
              </label>
              <Input
                id={`${question.id}-answer`}
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
                disabled={isChecked}
                placeholder={question.placeholder ?? "Nhập đáp án"}
                autoComplete="off"
              />
            </div>
          ) : null}
        </fieldset>

        {isChecked ? (
          <div
            aria-live="polite"
            className={cn(
              "mt-4 flex items-start gap-3 rounded-xl p-4 text-sm",
              isCorrect
                ? "bg-success-subtle text-success-text"
                : "bg-danger-subtle text-danger-text",
            )}
          >
            {isCorrect ? (
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            ) : (
              <X aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            )}
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-semibold">
                {isCorrect ? "Chính xác!" : "Chưa đúng."}
              </p>
              {!isCorrect ? (
                <p>Đáp án đúng: {getCorrectAnswerText(question)}</p>
              ) : null}
              <p>{question.explanation}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            {isChecked
              ? "Xem giải thích rồi chuyển sang câu tiếp theo."
              : "Chọn đáp án hoặc nhập câu trả lời rồi bấm Kiểm tra."}
          </p>
          <Button type="submit" disabled={!isChecked && response === null}>
            {isChecked
              ? isLastQuestion
                ? "Xem kết quả"
                : "Câu tiếp theo"
              : "Kiểm tra"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function AlgorithmQuizSummary({
  questions,
  results,
}: AlgorithmQuizSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const correctCount = results.filter((result) => result.isCorrect).length;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-label="Kết quả bài kiểm tra"
      className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-sm sm:p-7"
    >
      <p className="text-sm font-medium text-accent-text">Hoàn thành</p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-1 text-xl font-semibold tracking-tight text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-default"
      >
        Bạn trả lời đúng {correctCount}/{questions.length} câu
      </h2>
      <p className="mt-2 text-sm text-text-secondary">
        Tải lại trang để nhận bộ câu hỏi mới.
      </p>

      <ol className="mt-5 flex flex-col gap-3">
        {questions.map((question, index) => {
          const result = results.find(
            (item) => item.questionId === question.id,
          );
          const isCorrect = result?.isCorrect ?? false;
          return (
            <li
              key={question.id}
              className="rounded-xl border border-border-default bg-bg-page p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                {isCorrect ? (
                  <Check
                    aria-hidden="true"
                    className="size-4 text-success-text"
                  />
                ) : (
                  <X aria-hidden="true" className="size-4 text-danger-text" />
                )}
                <span className="text-sm font-semibold text-text-primary">
                  Câu {index + 1}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-text-primary">
                {question.prompt}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Đáp án đúng: {getCorrectAnswerText(question)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function AlgorithmQuizView({ questions }: AlgorithmQuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<readonly IQuizAnswerRecord[]>([]);

  if (questions.length === 0) {
    return null;
  }

  function handleNext(result: IQuizAnswerRecord) {
    setResults((previous) => [...previous, result]);
    setCurrentIndex((index) => index + 1);
  }

  if (currentIndex >= questions.length) {
    return <AlgorithmQuizSummary questions={questions} results={results} />;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <QuizQuestionCard
      key={currentQuestion.id}
      question={currentQuestion}
      index={currentIndex}
      total={questions.length}
      onNext={handleNext}
    />
  );
}
