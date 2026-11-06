"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@/db";
import {
  classMembersTable,
  examsTable,
  submissionAnswerOptionsTable,
  submissionAnswersTable,
  submissionsTable,
} from "@/db/schema";
import { actionError, getUnknownErrorMessage } from "./action-helpers";
import { requireStudentUser } from "./auth";
import {
  gradeQuestion,
  type IGradingQuestion,
  type IStudentAnswerInput,
} from "./grading";
import { getStudentExamHref } from "./routes";
import type { ILearningActionState } from "./types";
import { extractBlankIndexes, getFormInt, getFormText } from "./validation";

function isDeadlinePassed(deadline: Date | null): boolean {
  return deadline !== null && deadline.getTime() <= Date.now();
}

function parseSelectedOptionIds(
  formData: FormData,
  examQuestionId: number,
): readonly number[] {
  return formData.getAll(`question-${examQuestionId}`).flatMap((value) => {
    if (typeof value !== "string") {
      return [];
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) ? [parsed] : [];
  });
}

function parseBlankValues(
  formData: FormData,
  examQuestionId: number,
  content: string,
): Record<string, string> | null {
  const indexes = extractBlankIndexes(content);
  const effectiveIndexes = indexes.length > 0 ? indexes : [1];
  const values: Record<string, string> = {};
  for (const index of effectiveIndexes) {
    const value = getFormText(formData, `blank-${examQuestionId}-${index}`);
    if (value !== "") {
      values[String(index)] = value;
    }
  }
  return Object.keys(values).length > 0 ? values : null;
}

export async function startSubmissionAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStudentUser();
  const examId = getFormInt(formData, "examId");
  if (examId === undefined) {
    return actionError("Bài kiểm tra không hợp lệ.");
  }

  const exam = await db.query.examsTable.findFirst({
    where: eq(examsTable.id, examId),
    with: {
      class: {
        with: {
          members: {
            where: eq(classMembersTable.userId, user.id),
            columns: { id: true },
          },
        },
      },
    },
  });
  if (!exam) {
    return actionError("Không tìm thấy bài kiểm tra.");
  }
  if (exam.class.members.length === 0) {
    return actionError("Bạn không thuộc lớp của bài kiểm tra này.");
  }
  if (exam.class.status !== "active") {
    return actionError("Lớp đã lưu trữ, không thể làm bài.");
  }
  if (exam.status === "draft") {
    return actionError("Bài kiểm tra chưa được công bố.");
  }
  if (exam.status === "closed" || isDeadlinePassed(exam.deadline)) {
    return actionError("Bài kiểm tra đã đóng.");
  }

  try {
    await db
      .insert(submissionsTable)
      .values({
        examId,
        studentId: user.id,
        status: "in_progress",
      })
      .onConflictDoNothing();

    revalidatePath(getStudentExamHref(examId));
    redirect(getStudentExamHref(examId));
  } catch (error) {
    unstable_rethrow(error);
    return actionError(getUnknownErrorMessage(error));
  }
}

export async function saveSubmissionAction(
  _previousState: ILearningActionState,
  formData: FormData,
): Promise<ILearningActionState> {
  const user = await requireStudentUser();
  const examId = getFormInt(formData, "examId");
  const intent = getFormText(formData, "intent");
  if (examId === undefined) {
    return actionError("Bài kiểm tra không hợp lệ.");
  }
  if (intent !== "draft" && intent !== "submit") {
    return actionError("Thao tác không hợp lệ.");
  }

  const exam = await db.query.examsTable.findFirst({
    where: eq(examsTable.id, examId),
    with: {
      class: {
        with: {
          members: {
            where: eq(classMembersTable.userId, user.id),
            columns: { id: true },
          },
        },
      },
      examQuestions: {
        with: {
          question: {
            with: {
              options: {
                columns: { id: true, isCorrect: true },
                orderBy: (options, { asc }) => [asc(options.position)],
              },
              answerKeys: true,
            },
          },
        },
        orderBy: (examQuestions, { asc }) => [asc(examQuestions.position)],
      },
      submissions: {
        where: eq(submissionsTable.studentId, user.id),
      },
    },
  });

  if (!exam) {
    return actionError("Không tìm thấy bài kiểm tra.");
  }
  if (exam.class.members.length === 0) {
    return actionError("Bạn không thuộc lớp của bài kiểm tra này.");
  }
  if (exam.class.status !== "active") {
    return actionError("Lớp đã lưu trữ, không thể lưu bài.");
  }
  if (exam.status === "draft") {
    return actionError("Bài kiểm tra chưa được công bố.");
  }
  if (exam.status === "closed" || isDeadlinePassed(exam.deadline)) {
    return actionError("Bài kiểm tra đã đóng, không thể lưu bài.");
  }

  const existingSubmission = exam.submissions[0];
  if (!existingSubmission) {
    return actionError("Bạn cần bắt đầu làm bài trước khi lưu.");
  }
  if (existingSubmission.status === "submitted") {
    return actionError("Bài làm đã được nộp, không thể sửa.");
  }

  try {
    let totalScore = 0;

    await db.transaction(async (tx) => {
      const [submission] = await tx
        .select()
        .from(submissionsTable)
        .where(eq(submissionsTable.id, existingSubmission.id))
        .for("update");
      if (!submission || submission.status === "submitted") {
        throw new Error("Bài làm đã được nộp, không thể sửa.");
      }

      await tx
        .delete(submissionAnswersTable)
        .where(eq(submissionAnswersTable.submissionId, submission.id));

      for (const examQuestion of exam.examQuestions) {
        const selectedOptionIds = parseSelectedOptionIds(
          formData,
          examQuestion.id,
        );
        const blankValues =
          examQuestion.question.type === "fill_blank"
            ? parseBlankValues(
                formData,
                examQuestion.id,
                examQuestion.question.content,
              )
            : null;
        const textValue =
          examQuestion.question.type === "final_answer"
            ? getFormText(formData, `answer-${examQuestion.id}`) || null
            : null;

        const validOptionIds = new Set(
          examQuestion.question.options.map((option) => option.id),
        );
        if (
          selectedOptionIds.some((optionId) => !validOptionIds.has(optionId))
        ) {
          throw new Error("Lựa chọn không hợp lệ.");
        }
        if (
          examQuestion.question.type === "multiple_choice" &&
          !examQuestion.question.allowMultiple &&
          selectedOptionIds.length > 1
        ) {
          throw new Error("Câu chọn một đáp án chỉ được chọn một lựa chọn.");
        }

        const hasAnswer =
          selectedOptionIds.length > 0 ||
          (blankValues !== null && Object.keys(blankValues).length > 0) ||
          textValue !== null;

        if (intent === "draft" && !hasAnswer) {
          continue;
        }

        const answerInput: IStudentAnswerInput = {
          textValue,
          blankValues,
          selectedOptionIds,
        };

        const gradingQuestion: IGradingQuestion = {
          id: examQuestion.question.id,
          type: examQuestion.question.type,
          points: examQuestion.points,
          options: examQuestion.question.options.map((option) => ({
            id: option.id,
            isCorrect: option.isCorrect,
          })),
          answerKeys: examQuestion.question.answerKeys.map((key) => ({
            blankIndex: key.blankIndex,
            acceptedValue: key.acceptedValue,
            matchMode: key.matchMode,
          })),
        };

        const grade =
          intent === "submit"
            ? gradeQuestion(gradingQuestion, answerInput)
            : null;

        if (grade) {
          totalScore += grade.score;
        }

        const [answer] = await tx
          .insert(submissionAnswersTable)
          .values({
            submissionId: submission.id,
            examQuestionId: examQuestion.id,
            textValue,
            blankValues,
            isCorrect: grade?.isCorrect ?? null,
            score: grade?.score ?? null,
          })
          .returning({ id: submissionAnswersTable.id });

        if (selectedOptionIds.length > 0) {
          await tx.insert(submissionAnswerOptionsTable).values(
            selectedOptionIds.map((optionId) => ({
              submissionAnswerId: answer.id,
              optionId,
            })),
          );
        }
      }

      if (intent === "submit") {
        await tx
          .update(submissionsTable)
          .set({
            status: "submitted",
            submittedAt: new Date(),
            score: totalScore,
          })
          .where(eq(submissionsTable.id, submission.id));
      }
    });

    revalidatePath(getStudentExamHref(examId));
    if (intent === "submit") {
      redirect(getStudentExamHref(examId));
    }
    return { success: "Đã lưu nháp bài làm." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(getUnknownErrorMessage(error));
  }
}
