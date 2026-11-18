import { describe, expect, test } from "bun:test";
import { QUIZ_BANKS } from "@/features/catalog/quiz";
import type { QuizTopic } from "@/features/catalog/quiz/types";

const ALGORITHM_KEYS = [
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
  "linear-search",
  "binary-search",
] as const;

const TOPIC_COUNTS: readonly {
  readonly topic: QuizTopic;
  readonly count: number;
}[] = [
  { topic: "concept", count: 2 },
  { topic: "mechanism", count: 3 },
  { topic: "complexity", count: 2 },
  { topic: "property", count: 2 },
  { topic: "application", count: 3 },
];

describe("ngân hàng câu hỏi", () => {
  test("có đủ ngân hàng cho 7 thuật toán", () => {
    expect(Object.keys(QUIZ_BANKS).sort()).toEqual([...ALGORITHM_KEYS].sort());
  });

  test("mã câu hỏi không trùng trên toàn bộ ngân hàng", () => {
    const ids = Object.values(QUIZ_BANKS)
      .flat()
      .map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const key of ALGORITHM_KEYS) {
    const bank = QUIZ_BANKS[key];

    test(`${key} có 12 câu`, () => {
      expect(bank).toHaveLength(12);
    });

    test(`${key} phân bổ đủ topic`, () => {
      for (const { topic, count } of TOPIC_COUNTS) {
        expect(
          bank.filter((question) => question.topic === topic),
        ).toHaveLength(count);
      }
    });

    test(`${key} có đủ dạng câu hỏi`, () => {
      const typeCounts = new Map<string, number>();
      for (const question of bank) {
        typeCounts.set(question.type, (typeCounts.get(question.type) ?? 0) + 1);
      }
      expect(typeCounts.get("single_choice")).toBe(4);
      expect(typeCounts.get("multiple_choice")).toBe(3);
      expect(typeCounts.get("fill_blank")).toBe(2);
      expect(typeCounts.get("true_false")).toBe(3);
    });

    test(`${key} có nội dung và đáp án hợp lệ`, () => {
      for (const question of bank) {
        expect(question.prompt.trim()).not.toBe("");
        expect(question.explanation.trim()).not.toBe("");

        if (
          question.type === "single_choice" ||
          question.type === "multiple_choice"
        ) {
          const optionIds = question.options.map((option) => option.id);
          expect(new Set(optionIds).size).toBe(optionIds.length);
          expect(
            question.options.every((option) => option.text.trim() !== ""),
          ).toBe(true);
        }

        if (question.type === "single_choice") {
          expect(
            question.options.filter((option) => option.isCorrect),
          ).toHaveLength(1);
        }

        if (question.type === "multiple_choice") {
          const correctCount = question.options.filter(
            (option) => option.isCorrect,
          ).length;
          expect(correctCount).toBeGreaterThanOrEqual(2);
          expect(question.options.length - correctCount).toBeGreaterThanOrEqual(
            1,
          );
        }

        if (question.type === "fill_blank") {
          expect(question.accepted.length).toBeGreaterThan(0);
          expect(question.accepted.every((value) => value.trim() !== "")).toBe(
            true,
          );
        }
      }
    });
  }
});
