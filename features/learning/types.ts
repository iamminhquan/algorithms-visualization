import type {
  AnswerMatchMode,
  BlankValues,
  ClassImportStatus,
  ExamStatus,
  IClassImportError,
  QuestionType,
  SubmissionStatus,
} from "@/db/schema";

export interface ILearningActionState {
  readonly error?: string;
  readonly success?: string;
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

export const INITIAL_LEARNING_ACTION_STATE: ILearningActionState = {};

export interface IClassImportSummary {
  readonly totalRows: number;
  readonly successRows: number;
  readonly failedRows: number;
  readonly errors: readonly IClassImportError[];
}

export interface IImportActionState extends ILearningActionState {
  readonly summary?: IClassImportSummary;
}

export const INITIAL_IMPORT_ACTION_STATE: IImportActionState = {};

export interface IQuestionOptionFormValue {
  readonly content: string;
  readonly isCorrect: boolean;
}

export interface IQuestionAnswerKeyFormValue {
  readonly blankIndex: number;
  readonly acceptedValue: string;
  readonly matchMode: AnswerMatchMode;
}

export interface IQuestionFormValues {
  readonly id?: number;
  readonly type: QuestionType;
  readonly content: string;
  readonly allowMultiple: boolean;
  readonly options: readonly IQuestionOptionFormValue[];
  readonly answerKeys: readonly IQuestionAnswerKeyFormValue[];
}

export interface IExamFormValues {
  readonly id?: number;
  readonly classId: number;
  readonly title: string;
  readonly description: string;
  readonly deadline: string | null;
}

export interface IStudentExamAnswer {
  readonly textValue: string | null;
  readonly blankValues: BlankValues | null;
  readonly selectedOptionIds: readonly number[];
  readonly isCorrect: boolean | null;
  readonly score: number | null;
}

export interface IStudentExamQuestion {
  readonly id: number;
  readonly type: QuestionType;
  readonly content: string;
  readonly points: number;
  readonly position: number;
  readonly allowMultiple: boolean;
  readonly options: readonly {
    readonly id: number;
    readonly content: string;
  }[];
  readonly blankIndexes: readonly number[];
  readonly answer: IStudentExamAnswer | null;
}

export interface IStudentExamSubmission {
  readonly id: number;
  readonly status: SubmissionStatus;
  readonly score: number | null;
  readonly submittedAt: Date | null;
}

export interface IStudentExamData {
  readonly id: number;
  readonly classId: number;
  readonly className: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: ExamStatus;
  readonly deadline: Date | null;
  readonly questions: readonly IStudentExamQuestion[];
  readonly submission: IStudentExamSubmission | null;
}

export interface IStaffSubmissionSummary {
  readonly id: number;
  readonly studentName: string;
  readonly studentEmail: string;
  readonly status: SubmissionStatus;
  readonly score: number | null;
  readonly submittedAt: Date | null;
}

export interface IImportJobSummary {
  readonly id: number;
  readonly fileName: string;
  readonly status: ClassImportStatus;
  readonly totalRows: number;
  readonly successRows: number;
  readonly failedRows: number;
  readonly errorDetails: readonly IClassImportError[];
  readonly createdAt: Date;
}
