import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { forbidden, notFound } from "next/navigation";
import { db } from "@/db";
import {
  classesTable,
  classImportJobsTable,
  classMembersTable,
  examsTable,
  questionsTable,
  submissionsTable,
} from "@/db/schema";
import { canManageClass, type ILearningUser } from "./auth";
import type {
  IImportJobSummary,
  IStudentExamData,
  IStudentExamQuestion,
} from "./types";
import { extractBlankIndexes } from "./validation";

export async function getStaffClasses(user: ILearningUser) {
  return db.query.classesTable.findMany({
    where:
      user.role === "admin" ? undefined : eq(classesTable.ownerId, user.id),
    with: {
      owner: true,
      members: true,
      exams: true,
    },
    orderBy: (classes, { desc }) => [desc(classes.createdAt)],
  });
}

export async function getStaffClassDetail(
  classId: number,
  user: ILearningUser,
) {
  const classRow = await db.query.classesTable.findFirst({
    where: eq(classesTable.id, classId),
    with: {
      owner: true,
      members: {
        with: { user: true },
        orderBy: (members, { asc }) => [asc(members.createdAt)],
      },
      exams: {
        with: {
          examQuestions: { columns: { id: true } },
          submissions: { columns: { id: true, status: true } },
        },
        orderBy: (exams, { desc }) => [desc(exams.createdAt)],
      },
      importJobs: {
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
      },
    },
  });

  if (!classRow) {
    notFound();
  }
  if (!canManageClass(user, classRow.ownerId)) {
    forbidden();
  }

  return classRow;
}

export async function getStaffExamDetail(examId: number, user: ILearningUser) {
  const exam = await db.query.examsTable.findFirst({
    where: eq(examsTable.id, examId),
    with: {
      class: {
        with: { owner: true },
      },
      examQuestions: {
        with: {
          question: {
            with: {
              options: {
                orderBy: (options, { asc }) => [asc(options.position)],
              },
              answerKeys: {
                orderBy: (keys, { asc }) => [
                  asc(keys.blankIndex),
                  asc(keys.acceptedValue),
                ],
              },
            },
          },
        },
        orderBy: (examQuestions, { asc }) => [asc(examQuestions.position)],
      },
      submissions: {
        with: { student: true },
        orderBy: (submissions, { desc }) => [
          desc(submissions.submittedAt),
          desc(submissions.startedAt),
        ],
      },
    },
  });

  if (!exam) {
    notFound();
  }
  if (!canManageClass(user, exam.class.ownerId)) {
    forbidden();
  }

  return exam;
}

export async function getQuestionBank(user: ILearningUser) {
  return db.query.questionsTable.findMany({
    where:
      user.role === "admin" ? undefined : eq(questionsTable.createdBy, user.id),
    with: {
      options: {
        orderBy: (options, { asc }) => [asc(options.position)],
      },
      answerKeys: {
        orderBy: (keys, { asc }) => [
          asc(keys.blankIndex),
          asc(keys.acceptedValue),
        ],
      },
      examQuestions: {
        with: {
          exam: {
            columns: { id: true, title: true, status: true },
          },
        },
      },
    },
    orderBy: (questions, { desc }) => [desc(questions.createdAt)],
  });
}

export async function getImportJobSummaries(
  classId: number,
): Promise<readonly IImportJobSummary[]> {
  const rows = await db.query.classImportJobsTable.findMany({
    where: eq(classImportJobsTable.classId, classId),
    orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    limit: 10,
  });

  return rows.map((job) => ({
    id: job.id,
    fileName: job.fileName,
    status: job.status,
    totalRows: job.totalRows,
    successRows: job.successRows,
    failedRows: job.failedRows,
    errorDetails: job.errorDetails,
    createdAt: job.createdAt,
  }));
}

export async function getStudentClasses(user: ILearningUser) {
  return db.query.classMembersTable.findMany({
    where: eq(classMembersTable.userId, user.id),
    with: {
      class: {
        with: {
          owner: true,
          exams: {
            where: inArray(examsTable.status, ["published", "closed"]),
            with: {
              examQuestions: { columns: { id: true } },
              submissions: {
                where: eq(submissionsTable.studentId, user.id),
                columns: {
                  id: true,
                  status: true,
                  score: true,
                  submittedAt: true,
                },
              },
            },
            orderBy: (exams, { asc }) => [asc(exams.deadline), asc(exams.id)],
          },
        },
      },
    },
    orderBy: (members, { desc }) => [desc(members.createdAt)],
  });
}

export async function getStudentJoinPreview(code: string, user: ILearningUser) {
  return db.query.classesTable.findFirst({
    where: eq(classesTable.code, code),
    columns: { id: true, name: true, status: true },
    with: {
      members: {
        where: eq(classMembersTable.userId, user.id),
        columns: { id: true },
      },
    },
  });
}

export async function getStudentClassDetail(
  classId: number,
  user: ILearningUser,
) {
  const membership = await db.query.classMembersTable.findFirst({
    where: and(
      eq(classMembersTable.classId, classId),
      eq(classMembersTable.userId, user.id),
    ),
    with: {
      class: {
        with: {
          owner: true,
          exams: {
            where: inArray(examsTable.status, ["published", "closed"]),
            with: {
              examQuestions: { columns: { id: true } },
              submissions: {
                where: eq(submissionsTable.studentId, user.id),
                columns: {
                  id: true,
                  status: true,
                  score: true,
                  submittedAt: true,
                },
              },
            },
            orderBy: (exams, { asc }) => [asc(exams.deadline), asc(exams.id)],
          },
        },
      },
    },
  });

  if (!membership) {
    forbidden();
  }

  return membership.class;
}

export async function getStudentExamDetail(
  examId: number,
  user: ILearningUser,
): Promise<IStudentExamData> {
  const exam = await db.query.examsTable.findFirst({
    where: eq(examsTable.id, examId),
    with: {
      class: true,
      examQuestions: {
        with: {
          question: {
            with: {
              options: {
                columns: { id: true, content: true, position: true },
                orderBy: (options, { asc }) => [asc(options.position)],
              },
            },
          },
        },
        orderBy: (examQuestions, { asc }) => [asc(examQuestions.position)],
      },
      submissions: {
        where: eq(submissionsTable.studentId, user.id),
        with: {
          answers: {
            with: { selectedOptions: true },
          },
        },
      },
    },
  });

  if (!exam || exam.status === "draft") {
    notFound();
  }

  const membership = await db.query.classMembersTable.findFirst({
    where: and(
      eq(classMembersTable.classId, exam.classId),
      eq(classMembersTable.userId, user.id),
    ),
  });
  if (!membership) {
    forbidden();
  }

  const submission = exam.submissions[0];
  const answersByExamQuestion = new Map(
    submission?.answers.map((answer) => [answer.examQuestionId, answer]) ?? [],
  );

  const questions: readonly IStudentExamQuestion[] = exam.examQuestions.map(
    (examQuestion) => {
      const answer = answersByExamQuestion.get(examQuestion.id);
      const blankIndexes = extractBlankIndexes(examQuestion.question.content);
      return {
        id: examQuestion.id,
        type: examQuestion.question.type,
        content: examQuestion.question.content,
        points: examQuestion.points,
        position: examQuestion.position,
        allowMultiple: examQuestion.question.allowMultiple,
        options: examQuestion.question.options.map((option) => ({
          id: option.id,
          content: option.content,
        })),
        blankIndexes: blankIndexes.length > 0 ? blankIndexes : [1],
        answer: answer
          ? {
              textValue: answer.textValue,
              blankValues: answer.blankValues,
              selectedOptionIds: answer.selectedOptions.map(
                (selected) => selected.optionId,
              ),
              isCorrect: answer.isCorrect,
              score: answer.score,
            }
          : null,
      };
    },
  );

  return {
    id: exam.id,
    classId: exam.classId,
    className: exam.class.name,
    title: exam.title,
    description: exam.description,
    status: exam.status,
    deadline: exam.deadline,
    questions,
    submission: submission
      ? {
          id: submission.id,
          status: submission.status,
          score: submission.score,
          submittedAt: submission.submittedAt,
        }
      : null,
  };
}
