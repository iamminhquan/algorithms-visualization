"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@/db";
import {
  classesTable,
  examQuestionsTable,
  examsTable,
  questionsTable,
} from "@/db/schema";
import { actionError, getUnknownErrorMessage } from "./action-helpers";
import { requireStaffUser } from "./auth";
import { DEFAULT_EXAM_POINTS } from "./limits";
import {
  getAdminClassHref,
  getAdminExamHref,
  STUDENT_CLASSES_PATH,
} from "./routes";
import type { ILearningActionState } from "./types";
import {
  getFormInt,
  getFormNumber,
  getFormText,
  isUniqueViolation,
  parseDeadline,
} from "./validation";

async function getManagedClass(
  classId: number,
  userId: string,
  isAdmin: boolean,
) {
  const classRow = await db.query.classesTable.findFirst({
    where: eq(classesTable.id, classId),
    with: {
      owner: true,
      members: { columns: { id: true } },
    },
  });
  if (!classRow) {
    return null;
  }
  if (!isAdmin && classRow.ownerId !== userId) {
    return null;
  }
  return classRow;
}

async function getManagedExam(
  examId: number,
  userId: string,
  isAdmin: boolean,
) {
  const exam = await db.query.examsTable.findFirst({
    where: eq(examsTable.id, examId),
    with: {
      class: {
        with: {
          owner: true,
          members: { columns: { id: true } },
        },
      },
      examQuestions: { columns: { id: true } },
      submissions: { columns: { id: true } },
    },
  });
  if (!exam) {
    return null;
  }
  if (!isAdmin && exam.class.ownerId !== userId) {
    return null;
  }
  return exam;
}

function revalidateExamPaths(classId: number, examId: number): void {
  revalidatePath(getAdminClassHref(classId));
  revalidatePath(getAdminExamHref(classId, examId));
  revalidatePath(STUDENT_CLASSES_PATH);
}

export async function createExamAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const classId = getFormInt(formData, "classId");
  const title = getFormText(formData, "title");
  const description = getFormText(formData, "description");
  const deadlineInput = getFormText(formData, "deadline");
  const deadline = parseDeadline(deadlineInput);

  if (classId === undefined) {
    return actionError("Lớp học không hợp lệ.");
  }
  if (title === "") {
    return actionError("Tiêu đề bài kiểm tra không được để trống.");
  }
  if (deadlineInput !== "" && deadline === null) {
    return actionError("Hạn nộp không hợp lệ.");
  }

  const classRow = await getManagedClass(
    classId,
    user.id,
    user.role === "admin",
  );
  if (!classRow) {
    return actionError("Bạn không có quyền tạo bài kiểm tra cho lớp này.");
  }
  if (classRow.status !== "active") {
    return actionError("Lớp đã lưu trữ, không thể tạo bài kiểm tra.");
  }

  try {
    const [exam] = await db
      .insert(examsTable)
      .values({
        classId,
        createdBy: user.id,
        title,
        description: description === "" ? null : description,
        status: "draft",
        deadline,
      })
      .returning({ id: examsTable.id });

    revalidatePath(getAdminClassHref(classId));
    redirect(getAdminExamHref(classId, exam.id));
  } catch (error) {
    unstable_rethrow(error);
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function updateExamAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const examId = getFormInt(formData, "examId");
  const title = getFormText(formData, "title");
  const description = getFormText(formData, "description");
  const deadlineInput = getFormText(formData, "deadline");
  const deadline = parseDeadline(deadlineInput);

  if (examId === undefined) {
    return actionError("Bài kiểm tra không hợp lệ.");
  }
  if (title === "") {
    return actionError("Tiêu đề bài kiểm tra không được để trống.");
  }
  if (deadlineInput !== "" && deadline === null) {
    return actionError("Hạn nộp không hợp lệ.");
  }

  const exam = await getManagedExam(examId, user.id, user.role === "admin");
  if (!exam) {
    return actionError("Bạn không có quyền sửa bài kiểm tra này.");
  }
  if (exam.submissions.length > 0) {
    return actionError("Bài kiểm tra đã có bài nộp, không thể sửa thông tin.");
  }

  try {
    await db
      .update(examsTable)
      .set({
        title,
        description: description === "" ? null : description,
        deadline,
      })
      .where(eq(examsTable.id, examId));

    revalidateExamPaths(exam.classId, examId);
    redirect(getAdminExamHref(exam.classId, examId));
  } catch (error) {
    unstable_rethrow(error);
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function publishExamAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const examId = getFormInt(formData, "examId");
  if (examId === undefined) {
    return actionError("Bài kiểm tra không hợp lệ.");
  }

  const exam = await getManagedExam(examId, user.id, user.role === "admin");
  if (!exam) {
    return actionError("Bạn không có quyền công bố bài kiểm tra này.");
  }
  if (exam.status !== "draft") {
    return actionError("Chỉ có thể công bố bài kiểm tra ở trạng thái nháp.");
  }
  if (exam.class.status !== "active") {
    return actionError("Lớp đã lưu trữ, không thể công bố bài kiểm tra.");
  }
  if (exam.deadline !== null && exam.deadline.getTime() <= Date.now()) {
    return actionError("Hạn nộp đã qua, không thể công bố bài kiểm tra.");
  }
  if (exam.examQuestions.length === 0) {
    return actionError("Bài kiểm tra cần có ít nhất một câu hỏi.");
  }
  await db
    .update(examsTable)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(examsTable.id, examId));

  revalidateExamPaths(exam.classId, examId);
  return { success: "Đã công bố bài kiểm tra." };
}

export async function closeExamAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const examId = getFormInt(formData, "examId");
  if (examId === undefined) {
    return actionError("Bài kiểm tra không hợp lệ.");
  }

  const exam = await getManagedExam(examId, user.id, user.role === "admin");
  if (!exam) {
    return actionError("Bạn không có quyền đóng bài kiểm tra này.");
  }
  if (exam.status === "draft") {
    return actionError("Bài kiểm tra chưa được công bố.");
  }

  await db
    .update(examsTable)
    .set({ status: "closed" })
    .where(eq(examsTable.id, examId));

  revalidateExamPaths(exam.classId, examId);
  return { success: "Đã đóng bài kiểm tra." };
}

export async function deleteExamAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const examId = getFormInt(formData, "examId");
  if (examId === undefined) {
    return actionError("Bài kiểm tra không hợp lệ.");
  }

  const exam = await getManagedExam(examId, user.id, user.role === "admin");
  if (!exam) {
    return actionError("Bạn không có quyền xoá bài kiểm tra này.");
  }
  if (exam.submissions.length > 0) {
    return actionError("Bài kiểm tra đã có bài nộp, không thể xoá.");
  }

  await db.delete(examsTable).where(eq(examsTable.id, examId));
  revalidatePath(getAdminClassHref(exam.classId));
  redirect(getAdminClassHref(exam.classId));
}

export async function addExamQuestionAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const examId = getFormInt(formData, "examId");
  const questionId = getFormInt(formData, "questionId");
  const points = getFormNumber(formData, "points") ?? DEFAULT_EXAM_POINTS;
  if (examId === undefined || questionId === undefined) {
    return actionError("Câu hỏi hoặc bài kiểm tra không hợp lệ.");
  }
  if (points <= 0) {
    return actionError("Điểm của câu hỏi phải lớn hơn 0.");
  }

  const exam = await getManagedExam(examId, user.id, user.role === "admin");
  if (!exam) {
    return actionError("Bạn không có quyền sửa bài kiểm tra này.");
  }
  if (exam.status !== "draft") {
    return actionError("Chỉ có thể thêm câu hỏi khi bài kiểm tra còn nháp.");
  }

  const question = await db.query.questionsTable.findFirst({
    where: eq(questionsTable.id, questionId),
    columns: { id: true, createdBy: true },
  });
  if (!question) {
    return actionError("Không tìm thấy câu hỏi.");
  }
  if (user.role !== "admin" && question.createdBy !== user.id) {
    return actionError("Bạn chỉ có thể dùng câu hỏi trong ngân hàng của mình.");
  }

  try {
    const positions = await db.query.examQuestionsTable.findMany({
      where: eq(examQuestionsTable.examId, examId),
      columns: { position: true },
    });
    const nextPosition =
      positions.reduce((max, item) => Math.max(max, item.position), -1) + 1;

    await db.insert(examQuestionsTable).values({
      examId,
      questionId,
      points,
      position: nextPosition,
    });

    revalidateExamPaths(exam.classId, examId);
    return { success: "Đã thêm câu hỏi vào bài kiểm tra." };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return actionError("Câu hỏi đã có trong bài kiểm tra.");
    }
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function removeExamQuestionAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStaffUser();
  const examId = getFormInt(formData, "examId");
  const examQuestionId = getFormInt(formData, "examQuestionId");
  if (examId === undefined || examQuestionId === undefined) {
    return actionError("Câu hỏi không hợp lệ.");
  }

  const exam = await getManagedExam(examId, user.id, user.role === "admin");
  if (!exam) {
    return actionError("Bạn không có quyền sửa bài kiểm tra này.");
  }
  if (exam.status !== "draft") {
    return actionError("Chỉ có thể bỏ câu hỏi khi bài kiểm tra còn nháp.");
  }

  await db
    .delete(examQuestionsTable)
    .where(
      and(
        eq(examQuestionsTable.id, examQuestionId),
        eq(examQuestionsTable.examId, examId),
      ),
    );

  revalidateExamPaths(exam.classId, examId);
  return { success: "Đã bỏ câu hỏi khỏi bài kiểm tra." };
}
