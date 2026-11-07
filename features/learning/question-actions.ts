"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import * as XLSX from "xlsx";
import { db } from "@/db";
import type { QuestionType } from "@/db/schema";
import {
  examsTable,
  questionAnswerKeysTable,
  questionOptionsTable,
  questionsTable,
} from "@/db/schema";
import { actionError, getUnknownErrorMessage } from "./action-helpers";
import { canManageClass, type ILearningUser, requireStaffUser } from "./auth";
import { DEFAULT_EXAM_POINTS } from "./limits";
import {
  type IParsedAnswerKey,
  type IParsedOption,
  parseMatchMode,
  parseQuestionRows,
  parseQuestionType,
  validateQuestionInput,
} from "./question-file";
import { insertQuestion, insertQuestionContent } from "./question-store";
import {
  getAdminClassHref,
  getAdminExamHref,
  getAdminQuestionsHref,
} from "./routes";
import type {
  ILearningActionState,
  IQuestionImportActionState,
  IQuestionImportError,
} from "./types";
import {
  getFormFile,
  getFormInt,
  getFormNumber,
  getFormText,
  isUniqueViolation,
} from "./validation";

const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;

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

interface IExamQuestionTarget {
  readonly examId: number;
  readonly classId: number;
  readonly position: number;
}

type ExamQuestionTargetResult =
  | { readonly target: IExamQuestionTarget }
  | { readonly error: string };

/**
 * Kiểm tra quyền và trạng thái của bài kiểm tra trước khi gắn câu hỏi mới vào đề.
 * Chỉ đề nháp thuộc lớp đang hoạt động và do chính giáo viên phụ trách mới nhận câu hỏi.
 */
async function resolveExamQuestionTarget(
  examId: number,
  user: ILearningUser,
): Promise<ExamQuestionTargetResult> {
  const exam = await db.query.examsTable.findFirst({
    where: eq(examsTable.id, examId),
    with: {
      class: { columns: { ownerId: true, status: true } },
      examQuestions: { columns: { position: true } },
    },
  });
  if (!exam) {
    return { error: "Không tìm thấy bài kiểm tra." };
  }
  if (!canManageClass(user, exam.class.ownerId)) {
    return { error: "Bạn không có quyền thêm câu hỏi vào bài kiểm tra này." };
  }
  if (exam.status !== "draft") {
    return { error: "Chỉ có thể thêm câu hỏi khi bài kiểm tra còn nháp." };
  }
  if (exam.class.status !== "active") {
    return { error: "Lớp đã lưu trữ, không thể thêm câu hỏi." };
  }

  const position =
    exam.examQuestions.reduce(
      (max, examQuestion) => Math.max(max, examQuestion.position),
      -1,
    ) + 1;

  return {
    target: { examId: exam.id, classId: exam.classId, position },
  };
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

  const examId = getFormInt(formData, "examId");
  const points = getFormNumber(formData, "points") ?? DEFAULT_EXAM_POINTS;
  if (examId !== undefined && points <= 0) {
    return actionError("Điểm của câu hỏi phải lớn hơn 0.");
  }
  const targetResult =
    examId === undefined ? null : await resolveExamQuestionTarget(examId, user);
  if (targetResult && "error" in targetResult) {
    return actionError(targetResult.error);
  }
  const examTarget = targetResult?.target ?? null;

  try {
    await insertQuestion(
      {
        createdBy: user.id,
        type,
        content,
        allowMultiple,
        matchMode,
        options,
        answerKeys,
      },
      examTarget === null
        ? null
        : {
            examId: examTarget.examId,
            points,
            position: examTarget.position,
          },
    );
  } catch (error) {
    unstable_rethrow(error);
    if (isUniqueViolation(error)) {
      return actionError("Đáp án chấp nhận bị trùng, vui lòng kiểm tra lại.");
    }
    return actionError(getUnknownErrorMessage(error));
  }

  revalidatePath(getAdminQuestionsHref());
  if (examTarget !== null) {
    revalidatePath(getAdminClassHref(examTarget.classId));
    revalidatePath(getAdminExamHref(examTarget.classId, examTarget.examId));
    redirect(getAdminExamHref(examTarget.classId, examTarget.examId));
  }
  redirect(getAdminQuestionsHref());
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

export async function importQuestionsAction(
  _previousState: IQuestionImportActionState,
  formData: FormData,
): Promise<IQuestionImportActionState> {
  const user = await requireStaffUser();
  const file = getFormFile(formData, "file");
  if (!file) {
    return { error: "Vui lòng chọn file Excel hoặc CSV chứa câu hỏi." };
  }
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    return { error: "File vượt quá dung lượng 5MB." };
  }

  /*
   * Trang ngân hàng câu hỏi import vào ngân hàng; trang bài kiểm tra gửi kèm `examId`
   * để mỗi câu hỏi được gắn luôn vào đề nháp với số điểm trong file.
   */
  const examId = getFormInt(formData, "examId");
  const targetResult =
    examId === undefined ? null : await resolveExamQuestionTarget(examId, user);
  if (targetResult && "error" in targetResult) {
    return { error: targetResult.error };
  }
  const examTarget = targetResult?.target ?? null;

  let rows: readonly Readonly<Record<string, unknown>>[];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { error: "File không có sheet dữ liệu." };
    }
    const sheet = workbook.Sheets[firstSheetName];
    rows = XLSX.utils.sheet_to_json<Readonly<Record<string, unknown>>>(sheet, {
      defval: "",
    });
  } catch {
    return {
      error: "Không đọc được file. Vui lòng kiểm tra định dạng Excel/CSV.",
    };
  }

  const dataRows = rows.filter((row) =>
    Object.values(row).some((value) => String(value).trim() !== ""),
  );
  if (dataRows.length === 0) {
    return { error: "File không có dữ liệu câu hỏi." };
  }

  const parsed = parseQuestionRows(dataRows);
  const errors: IQuestionImportError[] = [...parsed.errors];
  let successRows = 0;
  let position = examTarget?.position ?? 0;

  for (const question of parsed.questions) {
    try {
      await insertQuestion(
        {
          createdBy: user.id,
          type: question.type,
          content: question.content,
          allowMultiple: question.allowMultiple,
          matchMode: question.matchMode,
          options: question.options,
          answerKeys: question.answerKeys,
        },
        examTarget === null
          ? null
          : {
              examId: examTarget.examId,
              points: question.points,
              position,
            },
      );
      successRows += 1;
      position += 1;
    } catch (error) {
      unstable_rethrow(error);
      errors.push({
        row: question.row,
        code: "INSERT_FAILED",
        message: getUnknownErrorMessage(error),
      });
    }
  }

  revalidatePath(getAdminQuestionsHref());
  if (examTarget !== null) {
    revalidatePath(getAdminClassHref(examTarget.classId));
    revalidatePath(getAdminExamHref(examTarget.classId, examTarget.examId));
  }

  const summary = {
    totalRows: dataRows.length,
    successRows,
    failedRows: dataRows.length - successRows,
    errors,
  };

  if (successRows === 0) {
    return { error: "Không import được câu hỏi nào.", summary };
  }

  return {
    success:
      examTarget === null
        ? `Đã import ${successRows} câu hỏi vào ngân hàng.`
        : `Đã import ${successRows} câu hỏi và thêm vào bài kiểm tra.`,
    summary,
  };
}
