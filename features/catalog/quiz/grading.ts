import type { IFillBlankQuestion, IQuizQuestion, IQuizResponse } from "./types";

const NUMERIC_TOLERANCE = 1e-6;

function normalizeText(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

function normalizeCaseInsensitive(value: string): string {
  return normalizeText(value).toLocaleLowerCase("vi");
}

function parseNumeric(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesAcceptedValue(
  value: string,
  acceptedValue: string,
  matchMode: IFillBlankQuestion["matchMode"],
): boolean {
  if (matchMode === "numeric") {
    const left = parseNumeric(value);
    const right = parseNumeric(acceptedValue);
    if (left === null || right === null) {
      return false;
    }
    return Math.abs(left - right) <= NUMERIC_TOLERANCE;
  }
  return (
    normalizeCaseInsensitive(value) === normalizeCaseInsensitive(acceptedValue)
  );
}

export function gradeQuizResponse(
  question: IQuizQuestion,
  response: IQuizResponse,
): boolean {
  switch (question.type) {
    case "single_choice": {
      if (response.type !== "single_choice") {
        return false;
      }
      return question.options.some(
        (option) => option.id === response.optionId && option.isCorrect,
      );
    }
    case "multiple_choice": {
      if (response.type !== "multiple_choice") {
        return false;
      }
      const correctIds = new Set(
        question.options
          .filter((option) => option.isCorrect)
          .map((option) => option.id),
      );
      const selectedIds = new Set(response.optionIds);
      if (selectedIds.size === 0) {
        return false;
      }
      return (
        selectedIds.size === correctIds.size &&
        [...selectedIds].every((id) => correctIds.has(id))
      );
    }
    case "true_false": {
      if (response.type !== "true_false") {
        return false;
      }
      return response.value === question.answer;
    }
    case "fill_blank": {
      if (response.type !== "fill_blank") {
        return false;
      }
      if (normalizeText(response.value) === "") {
        return false;
      }
      return question.accepted.some((acceptedValue) =>
        matchesAcceptedValue(response.value, acceptedValue, question.matchMode),
      );
    }
    default: {
      const unreachable: never = question;
      throw new Error(
        `Dạng câu hỏi không hợp lệ: ${JSON.stringify(unreachable)}`,
      );
    }
  }
}

export function getCorrectAnswerText(question: IQuizQuestion): string {
  switch (question.type) {
    case "single_choice":
    case "multiple_choice":
      return question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.text)
        .join(", ");
    case "true_false":
      return question.answer ? "Đúng" : "Sai";
    case "fill_blank":
      return question.accepted[0] ?? "";
    default: {
      const unreachable: never = question;
      throw new Error(
        `Dạng câu hỏi không hợp lệ: ${JSON.stringify(unreachable)}`,
      );
    }
  }
}
