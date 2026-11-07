import type { AnswerMatchMode, BlankValues, QuestionType } from "@/db/schema";

const NUMERIC_TOLERANCE = 1e-6;

export interface IGradingOption {
  readonly id: number;
  readonly isCorrect: boolean;
}

export interface IGradingAnswerKey {
  readonly blankIndex: number;
  readonly acceptedValue: string;
  readonly matchMode: AnswerMatchMode;
}

export interface IGradingQuestion {
  readonly id: number;
  readonly type: QuestionType;
  readonly points: number;
  readonly options: readonly IGradingOption[];
  readonly answerKeys: readonly IGradingAnswerKey[];
}

export interface IStudentAnswerInput {
  readonly textValue: string | null;
  readonly blankValues: BlankValues | null;
  readonly selectedOptionIds: readonly number[];
}

export interface IQuestionGrade {
  readonly isCorrect: boolean;
  readonly score: number;
}

function normalizeText(value: string): string {
  return value.normalize("NFC").trim();
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
  matchMode: AnswerMatchMode,
): boolean {
  if (matchMode === "numeric") {
    const left = parseNumeric(value);
    const right = parseNumeric(acceptedValue);
    if (left === null || right === null) {
      return false;
    }
    return Math.abs(left - right) <= NUMERIC_TOLERANCE;
  }

  if (matchMode === "case_insensitive") {
    return (
      normalizeCaseInsensitive(value) ===
      normalizeCaseInsensitive(acceptedValue)
    );
  }

  return normalizeText(value) === normalizeText(acceptedValue);
}

function gradeMultipleChoice(
  question: IGradingQuestion,
  answer: IStudentAnswerInput,
): boolean {
  const correctOptionIds = question.options
    .filter((option) => option.isCorrect)
    .map((option) => option.id);
  const selectedOptionIds = [...new Set(answer.selectedOptionIds)];

  if (correctOptionIds.length === 0 || selectedOptionIds.length === 0) {
    return false;
  }

  const correctSet = new Set(correctOptionIds);
  return (
    selectedOptionIds.length === correctSet.size &&
    selectedOptionIds.every((optionId) => correctSet.has(optionId))
  );
}

function gradeFillBlank(
  question: IGradingQuestion,
  answer: IStudentAnswerInput,
): boolean {
  const keysByBlank = new Map<number, readonly IGradingAnswerKey[]>();
  for (const key of question.answerKeys) {
    const existing = keysByBlank.get(key.blankIndex) ?? [];
    keysByBlank.set(key.blankIndex, [...existing, key]);
  }

  if (keysByBlank.size === 0) {
    return false;
  }

  for (const [blankIndex, keys] of keysByBlank) {
    const value = answer.blankValues?.[String(blankIndex)];
    if (typeof value !== "string" || normalizeText(value) === "") {
      return false;
    }
    const isMatched = keys.some((key) =>
      matchesAcceptedValue(value, key.acceptedValue, key.matchMode),
    );
    if (!isMatched) {
      return false;
    }
  }

  return true;
}

function gradeFinalAnswer(
  question: IGradingQuestion,
  answer: IStudentAnswerInput,
): boolean {
  const value = answer.textValue;
  if (value === null || normalizeText(value) === "") {
    return false;
  }
  return question.answerKeys.some((key) =>
    matchesAcceptedValue(value, key.acceptedValue, key.matchMode),
  );
}

export function gradeQuestion(
  question: IGradingQuestion,
  answer: IStudentAnswerInput,
): IQuestionGrade {
  const isCorrect =
    question.type === "multiple_choice"
      ? gradeMultipleChoice(question, answer)
      : question.type === "fill_blank"
        ? gradeFillBlank(question, answer)
        : gradeFinalAnswer(question, answer);

  return {
    isCorrect,
    score: isCorrect ? question.points : 0,
  };
}
