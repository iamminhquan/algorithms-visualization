import type { IQuizQuestion, QuizTopic } from "./types";

const TOPIC_SLOTS: readonly QuizTopic[] = [
  "concept",
  "mechanism",
  "complexity",
  "property",
  "application",
];
const DEFAULT_QUESTION_COUNT = 5;
const MIN_DISTINCT_TYPES = 3;
const MAX_ATTEMPTS = 10;

function shuffle<TValue>(
  values: readonly TValue[],
  random: () => number,
): readonly TValue[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = current;
  }
  return result;
}

function pickOne<TValue>(
  values: readonly TValue[],
  random: () => number,
): TValue | undefined {
  if (values.length === 0) {
    return undefined;
  }
  return values[Math.floor(random() * values.length)];
}

function shuffleQuestionOptions(
  question: IQuizQuestion,
  random: () => number,
): IQuizQuestion {
  if (
    question.type === "single_choice" ||
    question.type === "multiple_choice"
  ) {
    return { ...question, options: shuffle(question.options, random) };
  }
  return question;
}

function pickByTopic(
  bank: readonly IQuizQuestion[],
  count: number,
  random: () => number,
): readonly IQuizQuestion[] {
  const usedIds = new Set<string>();
  const picked: IQuizQuestion[] = [];

  for (const topic of TOPIC_SLOTS) {
    if (picked.length >= count) {
      break;
    }
    const topicPool = bank.filter(
      (question) => question.topic === topic && !usedIds.has(question.id),
    );
    const fallbackPool = bank.filter((question) => !usedIds.has(question.id));
    const question = pickOne(
      topicPool.length > 0 ? topicPool : fallbackPool,
      random,
    );
    if (!question) {
      break;
    }
    usedIds.add(question.id);
    picked.push(question);
  }

  for (const question of bank) {
    if (picked.length >= count) {
      break;
    }
    if (usedIds.has(question.id)) {
      continue;
    }
    usedIds.add(question.id);
    picked.push(question);
  }

  return picked;
}

export function pickQuizSet(
  bank: readonly IQuizQuestion[],
  count = DEFAULT_QUESTION_COUNT,
  random: () => number = Math.random,
): readonly IQuizQuestion[] {
  if (bank.length === 0 || count <= 0) {
    return [];
  }

  const expectedCount = Math.min(count, bank.length);
  const availableTypeCount = new Set(bank.map((question) => question.type))
    .size;
  const requiredTypeCount = Math.min(MIN_DISTINCT_TYPES, availableTypeCount);
  let bestPick: readonly IQuizQuestion[] = [];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const picked = pickByTopic(bank, count, random);
    if (picked.length > bestPick.length) {
      bestPick = picked;
    }
    const distinctTypes = new Set(picked.map((question) => question.type)).size;
    if (picked.length === expectedCount && distinctTypes >= requiredTypeCount) {
      return picked.map((question) => shuffleQuestionOptions(question, random));
    }
  }

  return bestPick.map((question) => shuffleQuestionOptions(question, random));
}
