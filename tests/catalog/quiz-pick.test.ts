import { describe, expect, test } from "bun:test";
import { QUIZ_BANKS } from "@/features/catalog/quiz";
import { pickQuizSet } from "@/features/catalog/quiz/pick";
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

const TOPICS: readonly QuizTopic[] = [
  "concept",
  "mechanism",
  "complexity",
  "property",
  "application",
];

function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("pickQuizSet", () => {
  test("chọn đúng 5 câu, đủ topic và không trùng", () => {
    for (const key of ALGORITHM_KEYS) {
      const bank = QUIZ_BANKS[key];
      for (let seed = 1; seed <= 20; seed++) {
        const picked = pickQuizSet(bank, 5, createRandom(seed));
        expect(picked).toHaveLength(5);
        expect(new Set(picked.map((question) => question.id)).size).toBe(5);
        expect(new Set(picked.map((question) => question.topic)).size).toBe(
          TOPICS.length,
        );
      }
    }
  });

  test("bộ câu có ít nhất 3 dạng khác nhau", () => {
    for (const key of ALGORITHM_KEYS) {
      const bank = QUIZ_BANKS[key];
      for (let seed = 1; seed <= 20; seed++) {
        const picked = pickQuizSet(bank, 5, createRandom(seed));
        expect(
          new Set(picked.map((question) => question.type)).size,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test("xáo thứ tự lựa chọn nhưng giữ nguyên đáp án đúng", () => {
    const bank = QUIZ_BANKS["bubble-sort"];
    const picked = pickQuizSet(bank, 5, () => 0);
    let hasReorderedOptions = false;

    for (const question of picked) {
      if (
        question.type !== "single_choice" &&
        question.type !== "multiple_choice"
      ) {
        continue;
      }
      const original = bank.find((item) => item.id === question.id);
      if (
        !original ||
        (original.type !== "single_choice" &&
          original.type !== "multiple_choice")
      ) {
        continue;
      }

      const originalOptions = new Map(
        original.options.map((option) => [option.id, option]),
      );
      for (const option of question.options) {
        const originalOption = originalOptions.get(option.id);
        expect(originalOption).toBeDefined();
        if (!originalOption) {
          continue;
        }
        expect(option.isCorrect).toBe(originalOption.isCorrect);
      }

      if (
        question.options.map((option) => option.id).join("|") !==
        original.options.map((option) => option.id).join("|")
      ) {
        hasReorderedOptions = true;
      }
    }

    expect(hasReorderedOptions).toBe(true);
  });

  test("bank ít hơn 5 câu thì trả về toàn bộ bank", () => {
    const bank = QUIZ_BANKS["bubble-sort"].slice(0, 3);
    const picked = pickQuizSet(bank, 5, createRandom(1));
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((question) => question.id)).size).toBe(3);
  });

  test("bank rỗng hoặc count không dương thì trả về mảng rỗng", () => {
    expect(pickQuizSet([], 5, createRandom(1))).toEqual([]);
    expect(pickQuizSet(QUIZ_BANKS["bubble-sort"], 0, createRandom(1))).toEqual(
      [],
    );
  });
});
