export type QuizTopic =
  | "concept"
  | "mechanism"
  | "complexity"
  | "property"
  | "application";

export type QuizLevel = "recognize" | "understand" | "apply";

export interface IQuizOption {
  readonly id: string;
  readonly text: string;
  readonly isCorrect: boolean;
}

interface IQuizQuestionBase {
  readonly id: string;
  readonly topic: QuizTopic;
  readonly level: QuizLevel;
  readonly prompt: string;
  readonly explanation: string;
}

export interface ISingleChoiceQuestion extends IQuizQuestionBase {
  readonly type: "single_choice";
  readonly options: readonly IQuizOption[];
}

export interface IMultipleChoiceQuestion extends IQuizQuestionBase {
  readonly type: "multiple_choice";
  readonly options: readonly IQuizOption[];
}

export interface ITrueFalseQuestion extends IQuizQuestionBase {
  readonly type: "true_false";
  readonly answer: boolean;
}

export interface IFillBlankQuestion extends IQuizQuestionBase {
  readonly type: "fill_blank";
  readonly accepted: readonly string[];
  readonly matchMode: "text" | "numeric";
  readonly placeholder?: string;
}

export type IQuizQuestion =
  | ISingleChoiceQuestion
  | IMultipleChoiceQuestion
  | ITrueFalseQuestion
  | IFillBlankQuestion;

export type IQuizResponse =
  | { readonly type: "single_choice"; readonly optionId: string }
  | { readonly type: "multiple_choice"; readonly optionIds: readonly string[] }
  | { readonly type: "true_false"; readonly value: boolean }
  | { readonly type: "fill_blank"; readonly value: string };
