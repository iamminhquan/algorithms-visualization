import { describe, expect, test } from "bun:test";
import {
  gradeQuestion,
  type IGradingQuestion,
  type IStudentAnswerInput,
} from "@/features/learning/grading";

const EMPTY_ANSWER: IStudentAnswerInput = {
  textValue: null,
  blankValues: null,
  selectedOptionIds: [],
};

function question(overrides: Partial<IGradingQuestion>): IGradingQuestion {
  return {
    id: 1,
    type: "multiple_choice",
    points: 2,
    options: [],
    answerKeys: [],
    ...overrides,
  };
}

describe("gradeQuestion", () => {
  test("trắc nghiệm chọn đúng một đáp án", () => {
    const result = gradeQuestion(
      question({
        options: [
          { id: 1, isCorrect: true },
          { id: 2, isCorrect: false },
        ],
      }),
      { ...EMPTY_ANSWER, selectedOptionIds: [1] },
    );
    expect(result).toEqual({ isCorrect: true, score: 2 });
  });

  test("trắc nghiệm chọn thiếu đáp án đúng thì sai", () => {
    const result = gradeQuestion(
      question({
        options: [
          { id: 1, isCorrect: true },
          { id: 2, isCorrect: true },
          { id: 3, isCorrect: false },
        ],
      }),
      { ...EMPTY_ANSWER, selectedOptionIds: [1] },
    );
    expect(result).toEqual({ isCorrect: false, score: 0 });
  });

  test("điền khuyết so khớp không phân biệt hoa thường", () => {
    const result = gradeQuestion(
      question({
        type: "fill_blank",
        points: 1,
        answerKeys: [
          {
            blankIndex: 1,
            acceptedValue: "Bubble Sort",
            matchMode: "case_insensitive",
          },
        ],
      }),
      { ...EMPTY_ANSWER, blankValues: { "1": "bubble sort" } },
    );
    expect(result).toEqual({ isCorrect: true, score: 1 });
  });

  test("điền khuyết nhiều chỗ phải đúng hết", () => {
    const answerKeys = [
      { blankIndex: 1, acceptedValue: "2", matchMode: "numeric" as const },
      { blankIndex: 2, acceptedValue: "3", matchMode: "numeric" as const },
    ];
    const result = gradeQuestion(
      question({ type: "fill_blank", points: 3, answerKeys }),
      { ...EMPTY_ANSWER, blankValues: { "1": "2", "2": "4" } },
    );
    expect(result).toEqual({ isCorrect: false, score: 0 });
  });

  test("kết quả cuối cùng so sánh số với dấu phẩy", () => {
    const result = gradeQuestion(
      question({
        type: "final_answer",
        points: 1,
        answerKeys: [
          { blankIndex: 1, acceptedValue: "3.14", matchMode: "numeric" },
        ],
      }),
      { ...EMPTY_ANSWER, textValue: "3,14" },
    );
    expect(result).toEqual({ isCorrect: true, score: 1 });
  });

  test("bỏ trống thì không được điểm", () => {
    const result = gradeQuestion(
      question({
        type: "final_answer",
        answerKeys: [
          { blankIndex: 1, acceptedValue: "42", matchMode: "exact" },
        ],
      }),
      EMPTY_ANSWER,
    );
    expect(result).toEqual({ isCorrect: false, score: 0 });
  });
});
