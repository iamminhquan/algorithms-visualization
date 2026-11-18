import type {
  IFillBlankQuestion,
  IMultipleChoiceQuestion,
  IQuizOption,
  ISingleChoiceQuestion,
  ITrueFalseQuestion,
  QuizLevel,
  QuizTopic,
} from "./types";

interface IQuizSeed {
  readonly id: string;
  readonly topic: QuizTopic;
  readonly level: QuizLevel;
  readonly prompt: string;
  readonly explanation: string;
}

interface IChoiceSeed extends IQuizSeed {
  readonly options: readonly string[];
}

interface ISingleChoiceSeed extends IChoiceSeed {
  readonly answer: number;
}

interface IMultipleChoiceSeed extends IChoiceSeed {
  readonly answers: readonly number[];
}

interface ITrueFalseSeed extends IQuizSeed {
  readonly answer: boolean;
}

interface IFillBlankSeed extends IQuizSeed {
  readonly accepted: readonly string[];
  readonly matchMode?: "text" | "numeric";
  readonly placeholder?: string;
}

function assertQuestionSeed(seed: IQuizSeed): void {
  if (seed.id.trim() === "") {
    throw new Error("Mã câu hỏi không được để trống");
  }
  if (seed.prompt.trim() === "") {
    throw new Error(`Câu hỏi "${seed.id}" thiếu nội dung`);
  }
  if (seed.explanation.trim() === "") {
    throw new Error(`Câu hỏi "${seed.id}" thiếu giải thích`);
  }
}

function createOptions(
  questionId: string,
  optionTexts: readonly string[],
  correctIndexes: readonly number[],
): readonly IQuizOption[] {
  if (optionTexts.length < 2) {
    throw new Error(`Câu hỏi "${questionId}" phải có ít nhất hai lựa chọn`);
  }
  const normalizedTexts = optionTexts.map((text) => text.trim());
  if (normalizedTexts.some((text) => text === "")) {
    throw new Error(`Câu hỏi "${questionId}" có lựa chọn để trống`);
  }
  if (new Set(normalizedTexts).size !== normalizedTexts.length) {
    throw new Error(`Câu hỏi "${questionId}" có lựa chọn trùng nội dung`);
  }
  if (correctIndexes.length === 0) {
    throw new Error(`Câu hỏi "${questionId}" chưa có đáp án đúng`);
  }
  const uniqueIndexes = new Set(correctIndexes);
  if (uniqueIndexes.size !== correctIndexes.length) {
    throw new Error(`Câu hỏi "${questionId}" có đáp án đúng bị lặp`);
  }
  for (const index of uniqueIndexes) {
    if (!Number.isInteger(index) || index < 0 || index >= optionTexts.length) {
      throw new Error(
        `Câu hỏi "${questionId}" có chỉ số đáp án không hợp lệ: ${index}`,
      );
    }
  }
  return Object.freeze(
    normalizedTexts.map((text, index) =>
      Object.freeze({
        id: `${questionId}.option.${index + 1}`,
        text,
        isCorrect: uniqueIndexes.has(index),
      }),
    ),
  );
}

export function singleChoice(seed: ISingleChoiceSeed): ISingleChoiceQuestion {
  assertQuestionSeed(seed);
  const { options, answer, ...base } = seed;
  return Object.freeze({
    ...base,
    type: "single_choice",
    options: createOptions(seed.id, options, [answer]),
  });
}

export function multipleChoice(
  seed: IMultipleChoiceSeed,
): IMultipleChoiceQuestion {
  assertQuestionSeed(seed);
  if (seed.answers.length < 2) {
    throw new Error(`Câu hỏi "${seed.id}" phải có ít nhất hai đáp án đúng`);
  }
  const { options, answers, ...base } = seed;
  return Object.freeze({
    ...base,
    type: "multiple_choice",
    options: createOptions(seed.id, options, answers),
  });
}

export function trueFalse(seed: ITrueFalseSeed): ITrueFalseQuestion {
  assertQuestionSeed(seed);
  return Object.freeze({
    ...seed,
    type: "true_false",
  });
}

export function fillBlank(seed: IFillBlankSeed): IFillBlankQuestion {
  assertQuestionSeed(seed);
  const normalizedAccepted = seed.accepted.map((value) => value.trim());
  if (
    normalizedAccepted.length === 0 ||
    normalizedAccepted.some((value) => value === "")
  ) {
    throw new Error(
      `Câu hỏi "${seed.id}" phải có ít nhất một đáp án được chấp nhận`,
    );
  }
  return Object.freeze({
    id: seed.id,
    topic: seed.topic,
    level: seed.level,
    prompt: seed.prompt,
    explanation: seed.explanation,
    type: "fill_blank",
    accepted: Object.freeze(normalizedAccepted),
    matchMode: seed.matchMode ?? "text",
    ...(seed.placeholder === undefined
      ? {}
      : { placeholder: seed.placeholder }),
  });
}
