"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@/db";
import type { AnswerMatchMode, QuestionType } from "@/db/schema";
import {
  questionAnswerKeysTable,
  questionOptionsTable,
  questionsTable,
} from "@/db/schema";
import { actionError, getUnknownErrorMessage } from "./action-helpers";
import { requireStaffUser } from "./auth";
import { getAdminQuestionsHref } from "./routes";
import type { ILearningActionState } from "./types";
import {
  extractBlankIndexes,
  getFormInt,
  getFormText,
  isUniqueViolation,
} from "./validation";

interface IParsedOption {
  readonly content: string;
  readonly isCorrect: boolean;
}

interface IParsedAnswerKey {
  readonly blankIndex: number;
  readonly acceptedValue: string;
}

function parseQuestionType(value: string): QuestionType | null {
  if (
    value === "multiple_choice" ||
    value === "fill_blank" ||
    value === "final_answer"
  ) {
    return value;
  }
  return null;
}

function parseMatchMode(value: string): AnswerMatchMode {
  if (value === "case_insensitive" || value === "numeric") {
    return value;
  }
  return "exact";
}

function parseOptions(formData: FormData): readonly IParsedOption[] {
  const options = new Map<number, IParsedOption>();
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("option-") || typeof value !== "string") {
      continue;
    }
    const index = Number(key.slice("option-".length));
    if (!Number.isInteger(index) || index < 0) {
      continue;
    }
    options.set(index, {
      content: value.trim(),
      isCorrect: formData.get(`correct-${index}`) === "on",
    });
  }
  return [...options.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, option]) => option);
}

function parseAnswerKeyLine(
  line: string,
  type: QuestionType,
): IParsedAnswerKey | null {
  if (type === "final_answer") {
    return { blankIndex: 1, acceptedValue: line };
  }
  const separatorIndex = line.indexOf("=");
  if (separatorIndex === -1) {
    return { blankIndex: 1, acceptedValue: line };
  }
  const blankIndex = Number(line.slice(0, separatorIndex).trim());
  const acceptedValue = line.slice(separatorIndex + 1).trim();
  if (!Number.isInteger(blankIndex) || blankIndex < 1 || acceptedValue === "") {
    return null;
  }
  return { blankIndex, acceptedValue };
}

function parseAnswerKeys(
  formData: FormData,
  type: QuestionType,
): readonly IParsedAnswerKey[] {
  return getFormText(formData, "answerKeys")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => parseAnswerKeyLine(line, type))
    .filter((key): key is IParsedAnswerKey => key !== null);
}

function validateQuestionInput(
  type: QuestionType,
  content: string,
  options: readonly IParsedOption[],
  answerKeys: readonly IParsedAnswerKey[],
  allowMultiple: boolean,
): string | null {
  if (content === "") {
    return "Nội dung câu hỏi không được để trống.";
  }

  if (type === "multiple_choice") {
    if (options.length < 2) {
      return "Câu trắc nghiệm cần ít nhất 2 lựa chọn.";
    }
    if (options.some((option) => option.content === "")) {
      return "Nội dung lựa chọn không được để trống.";
    }
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount === 0) {
      return "Cần chọn ít nhất một đáp án đúng.";
    }
    if (!allowMultiple && correctCount !== 1) {
      return "Câu chọn một đáp án chỉ được có đúng một đáp án đúng.";
    }
    return null;
  }

  if (answerKeys.length === 0) {
    return "Cần nhập ít nhất một đáp án chấp nhận.";
  }
  if (answerKeys.some((key) => key.acceptedValue === "")) {
    return "Đáp án chấp nhận không được để trống.";
  }

  if (type === "fill_blank") {
    const blankIndexes = extractBlankIndexes(content);
    if (blankIndexes.length === 0) {
      return "Nội dung điền khuyết cần có chỗ trống dạng {{1}}, {{2}}...";
    }
    const keyIndexes = new Set(answerKeys.map((key) => key.blankIndex));
    for (const blankIndex of blankIndexes) {
      if (!keyIndexes.has(blankIndex)) {
        return `Chỗ trống {{${blankIndex}}} chưa có đáp án.`;
      }
    }
    for (const keyIndex of keyIndexes) {
      if (!blankIndexes.includes(keyIndex)) {
        return `Đáp án cho chỗ trống ${keyIndex} không tồn tại trong nội dung.`;
      }
    }
  }

  return null;
}

async function insertQuestionContent(
  questionId: number,
  type: QuestionType,
  options: readonly IParsedOption[],
  answerKeys: readonly IParsedAnswerKey[],
  matchMode: AnswerMatchMode,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<void> {
  if (type === "multiple_choice") {
    await tx.insert(questionOptionsTable).values(
      options.map((option, index) => ({
        questionId,
        content: option.content,
        isCorrect: option.isCorrect,
        position: index,
      })),
    );
    return;
  }

  await tx.insert(questionAnswerKeysTable).values(
    answerKeys.map((key) => ({
      questionId,
      blankIndex: key.blankIndex,
      acceptedValue: key.acceptedValue,
      matchMode,
    })),
  );
}

export async function createQuestionAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const type = parseQuestionType(getFormText(formData, "type"));
  if (!type) {
    return actionError("Loại câu hỏi không hợp lệ.");
  }

  const content = getFormText(formData, "content");
  const allowMultiple = formData.get("allowMultiple") === "on";
  const matchMode = parseMatchMode(getFormText(formData, "matchMode"));
  const options = parseOptions(formData);
  const answerKeys = parseAnswerKeys(formData, type);
  const validationError = validateQuestionInput(
    type,
    content,
    options,
    answerKeys,
    allowMultiple,
  );
  if (validationError) {
    return actionError(validationError);
  }

  try {
    await db.transaction(async (tx) => {
      const [question] = await tx
        .insert(questionsTable)
        .values({
          createdBy: user.id,
          type,
          content,
          allowMultiple: type === "multiple_choice" ? allowMultiple : false,
        })
        .returning({ id: questionsTable.id });
      await insertQuestionContent(
        question.id,
        type,
        options,
        answerKeys,
        matchMode,
        tx,
      );
    });

    revalidatePath(getAdminQuestionsHref());
    redirect(getAdminQuestionsHref());
  } catch (error) {
    unstable_rethrow(error);
    if (isUniqueViolation(error)) {
      return actionError("Đáp án chấp nhận bị trùng, vui lòng kiểm tra lại.");
    }
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function updateQuestionAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const questionId = getFormInt(formData, "questionId");
  const type = parseQuestionType(getFormText(formData, "type"));
  if (questionId === undefined || !type) {
    return actionError("Câu hỏi không hợp lệ.");
  }

  const question = await db.query.questionsTable.findFirst({
    where: eq(questionsTable.id, questionId),
    with: {
      examQuestions: {
        with: {
          exam: {
            with: {
              submissions: { columns: { id: true } },
            },
          },
        },
      },
    },
  });
  if (!question) {
    return actionError("Không tìm thấy câu hỏi.");
  }
  if (user.role !== "admin" && question.createdBy !== user.id) {
    return actionError("Bạn không có quyền sửa câu hỏi này.");
  }
  const isUsedByLockedExam = question.examQuestions.some(
    ({ exam }) => exam.status !== "draft" || exam.submissions.length > 0,
  );
  if (isUsedByLockedExam) {
    return actionError(
      "Câu hỏi đã dùng trong đề đã công bố hoặc đã có bài nộp, không thể sửa.",
    );
  }

  const content = getFormText(formData, "content");
  const allowMultiple = formData.get("allowMultiple") === "on";
  const matchMode = parseMatchMode(getFormText(formData, "matchMode"));
  const options = parseOptions(formData);
  const answerKeys = parseAnswerKeys(formData, type);
  const validationError = validateQuestionInput(
    type,
    content,
    options,
    answerKeys,
    allowMultiple,
  );
  if (validationError) {
    return actionError(validationError);
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(questionsTable)
        .set({
          type,
          content,
          allowMultiple: type === "multiple_choice" ? allowMultiple : false,
        })
        .where(eq(questionsTable.id, questionId));
      await tx
        .delete(questionOptionsTable)
        .where(eq(questionOptionsTable.questionId, questionId));
      await tx
        .delete(questionAnswerKeysTable)
        .where(eq(questionAnswerKeysTable.questionId, questionId));
      await insertQuestionContent(
        questionId,
        type,
        options,
        answerKeys,
        matchMode,
        tx,
      );
    });

    revalidatePath(getAdminQuestionsHref());
    redirect(getAdminQuestionsHref());
  } catch (error) {
    unstable_rethrow(error);
    if (isUniqueViolation(error)) {
      return actionError("Đáp án chấp nhận bị trùng, vui lòng kiểm tra lại.");
    }
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function deleteQuestionAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const questionId = getFormInt(formData, "questionId");
  if (questionId === undefined) {
    return actionError("Câu hỏi không hợp lệ.");
  }

  const question = await db.query.questionsTable.findFirst({
    where: eq(questionsTable.id, questionId),
    with: {
      examQuestions: { columns: { id: true } },
    },
  });
  if (!question) {
    return actionError("Không tìm thấy câu hỏi.");
  }
  if (user.role !== "admin" && question.createdBy !== user.id) {
    return actionError("Bạn không có quyền xoá câu hỏi này.");
  }
  if (question.examQuestions.length > 0) {
    return actionError(
      "Câu hỏi đang được dùng trong bài kiểm tra, không thể xoá.",
    );
  }

  await db.delete(questionsTable).where(eq(questionsTable.id, questionId));
  revalidatePath(getAdminQuestionsHref());
  return { success: "Đã xoá câu hỏi." };
}
