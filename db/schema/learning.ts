import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { timestamps } from "./columns";

export const CLASS_STATUS_VALUES = ["active", "archived"] as const;

export type ClassStatus = (typeof CLASS_STATUS_VALUES)[number];

export const CLASS_JOIN_METHOD_VALUES = ["code", "excel_import"] as const;

export type ClassJoinMethod = (typeof CLASS_JOIN_METHOD_VALUES)[number];

export const CLASS_IMPORT_STATUS_VALUES = [
  "pending",
  "processing",
  "done",
  "failed",
] as const;

export type ClassImportStatus = (typeof CLASS_IMPORT_STATUS_VALUES)[number];

export const EXAM_STATUS_VALUES = ["draft", "published", "closed"] as const;

export type ExamStatus = (typeof EXAM_STATUS_VALUES)[number];

export const QUESTION_TYPE_VALUES = [
  "multiple_choice",
  "fill_blank",
  "final_answer",
] as const;

export type QuestionType = (typeof QUESTION_TYPE_VALUES)[number];

export const ANSWER_MATCH_MODE_VALUES = [
  "exact",
  "case_insensitive",
  "numeric",
] as const;

export type AnswerMatchMode = (typeof ANSWER_MATCH_MODE_VALUES)[number];

export const SUBMISSION_STATUS_VALUES = ["in_progress", "submitted"] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUS_VALUES)[number];

export interface IClassImportError {
  readonly row: number;
  readonly email: string;
  readonly studentCode: string | null;
  readonly code: string;
  readonly message: string;
}

export type BlankValues = Record<string, string>;

export const classesTable = pgTable(
  "classes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    code: text("code").notNull().unique(),
    minSize: integer("min_size").notNull().default(0),
    maxSize: integer("max_size").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    status: text("status").$type<ClassStatus>().notNull().default("active"),
    ...timestamps,
  },
  (table) => [
    index("classes_owner_id_idx").on(table.ownerId),
    check("classes_code_format", sql`${table.code} ~ '^[A-Z0-9]{6,8}$'`),
    check("classes_name_not_empty", sql`length(trim(${table.name})) > 0`),
    check(
      "classes_size_valid",
      sql`${table.minSize} >= 0 and ${table.maxSize} > 0 and ${table.minSize} <= ${table.maxSize}`,
    ),
    check(
      "classes_status_valid",
      sql`${table.status} in ('active', 'archived')`,
    ),
  ],
);

export const classMembersTable = pgTable(
  "class_members",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    classId: integer("class_id")
      .notNull()
      .references(() => classesTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    joinMethod: text("join_method").$type<ClassJoinMethod>().notNull(),
    studentCode: text("student_code"),
    ...timestamps,
  },
  (table) => [
    unique("class_members_class_id_user_id_unique").on(
      table.classId,
      table.userId,
    ),
    uniqueIndex("class_members_class_id_student_code_unique")
      .on(table.classId, table.studentCode)
      .where(sql`${table.studentCode} is not null`),
    index("class_members_user_id_idx").on(table.userId),
    check(
      "class_members_join_method_valid",
      sql`${table.joinMethod} in ('code', 'excel_import')`,
    ),
    check(
      "class_members_student_code_not_empty",
      sql`${table.studentCode} is null or length(trim(${table.studentCode})) > 0`,
    ),
  ],
);

export const classImportJobsTable = pgTable(
  "class_import_jobs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    classId: integer("class_id")
      .notNull()
      .references(() => classesTable.id, { onDelete: "cascade" }),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    fileName: text("file_name").notNull(),
    status: text("status")
      .$type<ClassImportStatus>()
      .notNull()
      .default("pending"),
    totalRows: integer("total_rows").notNull().default(0),
    successRows: integer("success_rows").notNull().default(0),
    failedRows: integer("failed_rows").notNull().default(0),
    errorDetails: jsonb("error_details")
      .$type<readonly IClassImportError[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("class_import_jobs_class_id_created_at_idx").on(
      table.classId,
      table.createdAt,
    ),
    check(
      "class_import_jobs_status_valid",
      sql`${table.status} in ('pending', 'processing', 'done', 'failed')`,
    ),
    check(
      "class_import_jobs_counts_valid",
      sql`${table.totalRows} >= 0 and ${table.successRows} >= 0 and ${table.failedRows} >= 0 and ${table.successRows} + ${table.failedRows} <= ${table.totalRows}`,
    ),
  ],
);

export const questionsTable = pgTable(
  "questions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    type: text("type").$type<QuestionType>().notNull(),
    content: text("content").notNull(),
    allowMultiple: boolean("allow_multiple").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("questions_created_by_idx").on(table.createdBy),
    check(
      "questions_type_valid",
      sql`${table.type} in ('multiple_choice', 'fill_blank', 'final_answer')`,
    ),
    check(
      "questions_content_not_empty",
      sql`length(trim(${table.content})) > 0`,
    ),
  ],
);

export const questionOptionsTable = pgTable(
  "question_options",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    questionId: integer("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    position: integer("position").notNull(),
    ...timestamps,
  },
  (table) => [
    unique("question_options_question_id_position_unique").on(
      table.questionId,
      table.position,
    ),
    check(
      "question_options_content_not_empty",
      sql`length(trim(${table.content})) > 0`,
    ),
    check(
      "question_options_position_non_negative",
      sql`${table.position} >= 0`,
    ),
  ],
);

export const questionAnswerKeysTable = pgTable(
  "question_answer_keys",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    questionId: integer("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "cascade" }),
    blankIndex: integer("blank_index").notNull().default(1),
    acceptedValue: text("accepted_value").notNull(),
    matchMode: text("match_mode")
      .$type<AnswerMatchMode>()
      .notNull()
      .default("exact"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("question_answer_keys_question_blank_value_unique").on(
      table.questionId,
      table.blankIndex,
      sql`lower(${table.acceptedValue})`,
    ),
    check(
      "question_answer_keys_blank_index_positive",
      sql`${table.blankIndex} >= 1`,
    ),
    check(
      "question_answer_keys_accepted_value_not_empty",
      sql`length(trim(${table.acceptedValue})) > 0`,
    ),
    check(
      "question_answer_keys_match_mode_valid",
      sql`${table.matchMode} in ('exact', 'case_insensitive', 'numeric')`,
    ),
  ],
);

export const examsTable = pgTable(
  "exams",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    classId: integer("class_id")
      .notNull()
      .references(() => classesTable.id, { onDelete: "restrict" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<ExamStatus>().notNull().default("draft"),
    deadline: timestamp("deadline", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("exams_class_id_status_idx").on(table.classId, table.status),
    index("exams_created_by_idx").on(table.createdBy),
    check("exams_title_not_empty", sql`length(trim(${table.title})) > 0`),
    check(
      "exams_status_valid",
      sql`${table.status} in ('draft', 'published', 'closed')`,
    ),
  ],
);

export const examQuestionsTable = pgTable(
  "exam_questions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    examId: integer("exam_id")
      .notNull()
      .references(() => examsTable.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questionsTable.id, { onDelete: "restrict" }),
    points: numeric("points", { precision: 5, scale: 2, mode: "number" })
      .notNull()
      .default(1),
    position: integer("position").notNull(),
    ...timestamps,
  },
  (table) => [
    unique("exam_questions_exam_id_question_id_unique").on(
      table.examId,
      table.questionId,
    ),
    unique("exam_questions_exam_id_position_unique").on(
      table.examId,
      table.position,
    ),
    index("exam_questions_question_id_idx").on(table.questionId),
    check("exam_questions_points_positive", sql`${table.points} > 0`),
    check("exam_questions_position_non_negative", sql`${table.position} >= 0`),
  ],
);

export const submissionsTable = pgTable(
  "submissions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    examId: integer("exam_id")
      .notNull()
      .references(() => examsTable.id, { onDelete: "restrict" }),
    studentId: text("student_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    status: text("status")
      .$type<SubmissionStatus>()
      .notNull()
      .default("in_progress"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    score: numeric("score", { precision: 6, scale: 2, mode: "number" }),
    ...timestamps,
  },
  (table) => [
    unique("submissions_exam_id_student_id_unique").on(
      table.examId,
      table.studentId,
    ),
    index("submissions_exam_id_status_idx").on(table.examId, table.status),
    index("submissions_student_id_status_idx").on(
      table.studentId,
      table.status,
    ),
    check(
      "submissions_status_valid",
      sql`${table.status} in ('in_progress', 'submitted')`,
    ),
    check(
      "submissions_score_non_negative",
      sql`${table.score} is null or ${table.score} >= 0`,
    ),
  ],
);

export const submissionAnswersTable = pgTable(
  "submission_answers",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    submissionId: integer("submission_id")
      .notNull()
      .references(() => submissionsTable.id, { onDelete: "cascade" }),
    examQuestionId: integer("exam_question_id")
      .notNull()
      .references(() => examQuestionsTable.id, { onDelete: "restrict" }),
    textValue: text("text_value"),
    blankValues: jsonb("blank_values").$type<BlankValues>(),
    isCorrect: boolean("is_correct"),
    score: numeric("score", { precision: 6, scale: 2, mode: "number" }),
    ...timestamps,
  },
  (table) => [
    unique("submission_answers_submission_id_exam_question_id_unique").on(
      table.submissionId,
      table.examQuestionId,
    ),
    index("submission_answers_exam_question_id_idx").on(table.examQuestionId),
    check(
      "submission_answers_score_non_negative",
      sql`${table.score} is null or ${table.score} >= 0`,
    ),
  ],
);

export const submissionAnswerOptionsTable = pgTable(
  "submission_answer_options",
  {
    submissionAnswerId: integer("submission_answer_id")
      .notNull()
      .references(() => submissionAnswersTable.id, { onDelete: "cascade" }),
    optionId: integer("option_id")
      .notNull()
      .references(() => questionOptionsTable.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({
      name: "submission_answer_options_pk",
      columns: [table.submissionAnswerId, table.optionId],
    }),
    index("submission_answer_options_option_id_idx").on(table.optionId),
  ],
);

export type LearningClass = typeof classesTable.$inferSelect;
export type NewLearningClass = typeof classesTable.$inferInsert;

export type ClassMember = typeof classMembersTable.$inferSelect;
export type NewClassMember = typeof classMembersTable.$inferInsert;

export type ClassImportJob = typeof classImportJobsTable.$inferSelect;
export type NewClassImportJob = typeof classImportJobsTable.$inferInsert;

export type Question = typeof questionsTable.$inferSelect;
export type NewQuestion = typeof questionsTable.$inferInsert;

export type QuestionOption = typeof questionOptionsTable.$inferSelect;
export type NewQuestionOption = typeof questionOptionsTable.$inferInsert;

export type QuestionAnswerKey = typeof questionAnswerKeysTable.$inferSelect;
export type NewQuestionAnswerKey = typeof questionAnswerKeysTable.$inferInsert;

export type Exam = typeof examsTable.$inferSelect;
export type NewExam = typeof examsTable.$inferInsert;

export type ExamQuestion = typeof examQuestionsTable.$inferSelect;
export type NewExamQuestion = typeof examQuestionsTable.$inferInsert;

export type Submission = typeof submissionsTable.$inferSelect;
export type NewSubmission = typeof submissionsTable.$inferInsert;

export type SubmissionAnswer = typeof submissionAnswersTable.$inferSelect;
export type NewSubmissionAnswer = typeof submissionAnswersTable.$inferInsert;

export type SubmissionAnswerOption =
  typeof submissionAnswerOptionsTable.$inferSelect;
export type NewSubmissionAnswerOption =
  typeof submissionAnswerOptionsTable.$inferInsert;
