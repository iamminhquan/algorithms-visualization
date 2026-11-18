import { describe, expect, test } from "bun:test";
import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "@/features/catalog/quiz/authoring";
import {
  getCorrectAnswerText,
  gradeQuizResponse,
} from "@/features/catalog/quiz/grading";

const base = {
  topic: "concept",
  level: "recognize",
  prompt: "Câu hỏi thử",
  explanation: "Giải thích thử",
} as const;

describe("gradeQuizResponse", () => {
  test("chấm câu chọn một đáp án", () => {
    const question = singleChoice({
      ...base,
      id: "test.single",
      options: ["A", "B", "C"],
      answer: 1,
    });

    expect(
      gradeQuizResponse(question, {
        type: "single_choice",
        optionId: question.options[1].id,
      }),
    ).toBe(true);
    expect(
      gradeQuizResponse(question, {
        type: "single_choice",
        optionId: question.options[0].id,
      }),
    ).toBe(false);
    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: "B",
      }),
    ).toBe(false);
  });

  test("chấm câu chọn nhiều đáp án theo đúng tập hợp", () => {
    const question = multipleChoice({
      ...base,
      id: "test.multiple",
      options: ["A", "B", "C", "D"],
      answers: [0, 2],
    });
    const correctIds = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id);

    expect(
      gradeQuizResponse(question, {
        type: "multiple_choice",
        optionIds: correctIds,
      }),
    ).toBe(true);
    expect(
      gradeQuizResponse(question, {
        type: "multiple_choice",
        optionIds: [correctIds[0]],
      }),
    ).toBe(false);
    expect(
      gradeQuizResponse(question, {
        type: "multiple_choice",
        optionIds: [...correctIds, question.options[1].id],
      }),
    ).toBe(false);
    expect(
      gradeQuizResponse(question, {
        type: "multiple_choice",
        optionIds: [],
      }),
    ).toBe(false);
  });

  test("chấm câu đúng/sai", () => {
    const question = trueFalse({
      ...base,
      id: "test.true-false",
      answer: true,
    });

    expect(
      gradeQuizResponse(question, { type: "true_false", value: true }),
    ).toBe(true);
    expect(
      gradeQuizResponse(question, { type: "true_false", value: false }),
    ).toBe(false);
  });

  test("chấm câu điền đáp án dạng văn bản", () => {
    const question = fillBlank({
      ...base,
      id: "test.fill-text",
      accepted: ["đổi chỗ", "hoán đổi"],
      matchMode: "text",
    });

    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: "  ĐỔI   CHỖ ",
      }),
    ).toBe(true);
    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: "hoán đổi",
      }),
    ).toBe(true);
    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: "sai",
      }),
    ).toBe(false);
    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: "   ",
      }),
    ).toBe(false);
  });

  test("chấm câu điền đáp án dạng số", () => {
    const question = fillBlank({
      ...base,
      id: "test.fill-numeric",
      accepted: ["3.14"],
      matchMode: "numeric",
    });

    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: "3,14",
      }),
    ).toBe(true);
    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: " 3.1400001 ",
      }),
    ).toBe(true);
    expect(
      gradeQuizResponse(question, {
        type: "fill_blank",
        value: "3.15",
      }),
    ).toBe(false);
  });
});

describe("getCorrectAnswerText", () => {
  test("trả về đáp án đúng của từng dạng câu", () => {
    const single = singleChoice({
      ...base,
      id: "test.answer-single",
      options: ["A", "B"],
      answer: 1,
    });
    const multiple = multipleChoice({
      ...base,
      id: "test.answer-multiple",
      options: ["A", "B", "C"],
      answers: [0, 2],
    });
    const truthy = trueFalse({
      ...base,
      id: "test.answer-true-false",
      answer: false,
    });
    const blank = fillBlank({
      ...base,
      id: "test.answer-fill",
      accepted: ["O(n)", "tuyến tính"],
    });

    expect(getCorrectAnswerText(single)).toBe("B");
    expect(getCorrectAnswerText(multiple)).toBe("A, C");
    expect(getCorrectAnswerText(truthy)).toBe("Sai");
    expect(getCorrectAnswerText(blank)).toBe("O(n)");
  });
});
