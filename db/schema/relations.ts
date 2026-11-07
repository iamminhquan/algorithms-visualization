import { relations } from "drizzle-orm";
import { algorithmsTable, categoriesTable, runsTable } from "./algorithms";
import { accountsTable, sessionsTable, usersTable } from "./auth";
import { algorithmComplexitiesTable } from "./complexities";
import {
  classesTable,
  classImportJobsTable,
  classMembersTable,
  examQuestionsTable,
  examsTable,
  questionAnswerKeysTable,
  questionOptionsTable,
  questionsTable,
  submissionAnswerOptionsTable,
  submissionAnswersTable,
  submissionsTable,
} from "./learning";
import { algorithmSourceCodesTable } from "./sources";

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  algorithms: many(algorithmsTable),
}));

export const algorithmsRelations = relations(
  algorithmsTable,
  ({ one, many }) => ({
    category: one(categoriesTable, {
      fields: [algorithmsTable.categoryId],
      references: [categoriesTable.id],
    }),
    complexity: one(algorithmComplexitiesTable, {
      fields: [algorithmsTable.id],
      references: [algorithmComplexitiesTable.algorithmId],
    }),
    runs: many(runsTable),
    sourceCodes: many(algorithmSourceCodesTable),
  }),
);

export const algorithmComplexitiesRelations = relations(
  algorithmComplexitiesTable,
  ({ one }) => ({
    algorithm: one(algorithmsTable, {
      fields: [algorithmComplexitiesTable.algorithmId],
      references: [algorithmsTable.id],
    }),
  }),
);

export const algorithmSourceCodesRelations = relations(
  algorithmSourceCodesTable,
  ({ one }) => ({
    algorithm: one(algorithmsTable, {
      fields: [algorithmSourceCodesTable.algorithmId],
      references: [algorithmsTable.id],
    }),
  }),
);

export const runsRelations = relations(runsTable, ({ one }) => ({
  algorithm: one(algorithmsTable, {
    fields: [runsTable.algorithmId],
    references: [algorithmsTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
  ownedClasses: many(classesTable),
  classMemberships: many(classMembersTable),
  uploadedClassImports: many(classImportJobsTable),
  createdQuestions: many(questionsTable),
  createdExams: many(examsTable),
  submissions: many(submissionsTable),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

export const classesRelations = relations(classesTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [classesTable.ownerId],
    references: [usersTable.id],
  }),
  members: many(classMembersTable),
  importJobs: many(classImportJobsTable),
  exams: many(examsTable),
}));

export const classMembersRelations = relations(
  classMembersTable,
  ({ one }) => ({
    class: one(classesTable, {
      fields: [classMembersTable.classId],
      references: [classesTable.id],
    }),
    user: one(usersTable, {
      fields: [classMembersTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const classImportJobsRelations = relations(
  classImportJobsTable,
  ({ one }) => ({
    class: one(classesTable, {
      fields: [classImportJobsTable.classId],
      references: [classesTable.id],
    }),
    uploadedBy: one(usersTable, {
      fields: [classImportJobsTable.uploadedBy],
      references: [usersTable.id],
    }),
  }),
);

export const questionsRelations = relations(
  questionsTable,
  ({ one, many }) => ({
    createdBy: one(usersTable, {
      fields: [questionsTable.createdBy],
      references: [usersTable.id],
    }),
    options: many(questionOptionsTable),
    answerKeys: many(questionAnswerKeysTable),
    examQuestions: many(examQuestionsTable),
  }),
);

export const questionOptionsRelations = relations(
  questionOptionsTable,
  ({ one, many }) => ({
    question: one(questionsTable, {
      fields: [questionOptionsTable.questionId],
      references: [questionsTable.id],
    }),
    submissionAnswerOptions: many(submissionAnswerOptionsTable),
  }),
);

export const questionAnswerKeysRelations = relations(
  questionAnswerKeysTable,
  ({ one }) => ({
    question: one(questionsTable, {
      fields: [questionAnswerKeysTable.questionId],
      references: [questionsTable.id],
    }),
  }),
);

export const examsRelations = relations(examsTable, ({ one, many }) => ({
  class: one(classesTable, {
    fields: [examsTable.classId],
    references: [classesTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [examsTable.createdBy],
    references: [usersTable.id],
  }),
  examQuestions: many(examQuestionsTable),
  submissions: many(submissionsTable),
}));

export const examQuestionsRelations = relations(
  examQuestionsTable,
  ({ one, many }) => ({
    exam: one(examsTable, {
      fields: [examQuestionsTable.examId],
      references: [examsTable.id],
    }),
    question: one(questionsTable, {
      fields: [examQuestionsTable.questionId],
      references: [questionsTable.id],
    }),
    submissionAnswers: many(submissionAnswersTable),
  }),
);

export const submissionsRelations = relations(
  submissionsTable,
  ({ one, many }) => ({
    exam: one(examsTable, {
      fields: [submissionsTable.examId],
      references: [examsTable.id],
    }),
    student: one(usersTable, {
      fields: [submissionsTable.studentId],
      references: [usersTable.id],
    }),
    answers: many(submissionAnswersTable),
  }),
);

export const submissionAnswersRelations = relations(
  submissionAnswersTable,
  ({ one, many }) => ({
    submission: one(submissionsTable, {
      fields: [submissionAnswersTable.submissionId],
      references: [submissionsTable.id],
    }),
    examQuestion: one(examQuestionsTable, {
      fields: [submissionAnswersTable.examQuestionId],
      references: [examQuestionsTable.id],
    }),
    selectedOptions: many(submissionAnswerOptionsTable),
  }),
);

export const submissionAnswerOptionsRelations = relations(
  submissionAnswerOptionsTable,
  ({ one }) => ({
    submissionAnswer: one(submissionAnswersTable, {
      fields: [submissionAnswerOptionsTable.submissionAnswerId],
      references: [submissionAnswersTable.id],
    }),
    option: one(questionOptionsTable, {
      fields: [submissionAnswerOptionsTable.optionId],
      references: [questionOptionsTable.id],
    }),
  }),
);
