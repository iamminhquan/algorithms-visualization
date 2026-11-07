import { db } from "@/db";
import type { AnswerMatchMode, QuestionType } from "@/db/schema";
import {
  examQuestionsTable,
  questionAnswerKeysTable,
  questionOptionsTable,
  questionsTable,
} from "@/db/schema";
import type { IParsedAnswerKey, IParsedOption } from "./question-file";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Dữ liệu cần để tạo một câu hỏi trong ngân hàng. */
export interface IQuestionInsert {
  readonly createdBy: string;
  readonly type: QuestionType;
  readonly content: string;
  readonly allowMultiple: boolean;
  readonly matchMode: AnswerMatchMode;
  readonly options: readonly IParsedOption[];
  readonly answerKeys: readonly IParsedAnswerKey[];
}

/** Vị trí và điểm khi câu hỏi được gắn luôn vào một bài kiểm tra. */
export interface IExamQuestionInsert {
  readonly examId: number;
  readonly points: number;
  readonly position: number;
}

/**
 * Ghi lựa chọn hoặc đáp án chấp nhận của một câu hỏi. Tách riêng để action sửa câu hỏi
 * và action tạo câu hỏi dùng chung một quy tắc.
 */
export async function insertQuestionContent(
  questionId: number,
  type: QuestionType,
  options: readonly IParsedOption[],
  answerKeys: readonly IParsedAnswerKey[],
  matchMode: AnswerMatchMode,
  tx: Transaction,
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

/**
 * Tạo câu hỏi trong ngân hàng, tuỳ chọn gắn luôn vào một bài kiểm tra trong cùng transaction
 * để không sinh ra câu hỏi mồ côi khi bước gắn đề thất bại.
 *
 * @returns Id của câu hỏi vừa tạo.
 */
export async function insertQuestion(
  input: IQuestionInsert,
  attachment: IExamQuestionInsert | null = null,
): Promise<number> {
  return db.transaction(async (tx) => {
    const [question] = await tx
      .insert(questionsTable)
      .values({
        createdBy: input.createdBy,
        type: input.type,
        content: input.content,
        allowMultiple:
          input.type === "multiple_choice" ? input.allowMultiple : false,
      })
      .returning({ id: questionsTable.id });

    await insertQuestionContent(
      question.id,
      input.type,
      input.options,
      input.answerKeys,
      input.matchMode,
      tx,
    );

    if (attachment !== null) {
      await tx.insert(examQuestionsTable).values({
        examId: attachment.examId,
        questionId: question.id,
        points: attachment.points,
        position: attachment.position,
      });
    }

    return question.id;
  });
}
