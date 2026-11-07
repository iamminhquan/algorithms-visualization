import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { IStudentExamData, IStudentExamQuestion } from "../types";

function formatQuestionContent(content: string): string {
  return content.replace(/\{\{\s*(\d+)\s*\}\}/g, "[$1]");
}

function AnswerValue({ question }: { question: IStudentExamQuestion }) {
  const answer = question.answer;
  if (!answer) {
    return <p className="text-sm text-text-muted">Chưa trả lời.</p>;
  }

  if (question.type === "multiple_choice") {
    const selected = question.options.filter((option) =>
      answer.selectedOptionIds.includes(option.id),
    );
    if (selected.length === 0) {
      return <p className="text-sm text-text-muted">Chưa chọn đáp án.</p>;
    }
    return (
      <ul className="flex flex-col gap-1 text-sm text-text-primary">
        {selected.map((option) => (
          <li key={option.id}>• {option.content}</li>
        ))}
      </ul>
    );
  }

  if (question.type === "fill_blank") {
    const entries = Object.entries(answer.blankValues ?? {}).sort(
      ([left], [right]) => Number(left) - Number(right),
    );
    if (entries.length === 0) {
      return <p className="text-sm text-text-muted">Chưa điền chỗ trống.</p>;
    }
    return (
      <ul className="flex flex-col gap-1 text-sm text-text-primary">
        {entries.map(([index, value]) => (
          <li key={index}>
            Chỗ trống {index}: <strong>{value}</strong>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-sm text-text-primary">
      {answer.textValue?.trim() ? answer.textValue : "Chưa trả lời."}
    </p>
  );
}

function QuestionResult({ question }: { question: IStudentExamQuestion }) {
  if (!question.answer || question.answer.isCorrect === null) {
    return <Badge tone="neutral">Chưa chấm</Badge>;
  }
  return question.answer.isCorrect ? (
    <Badge tone="success">Đúng · {question.answer.score} điểm</Badge>
  ) : (
    <Badge tone="danger">Sai · 0 điểm</Badge>
  );
}

type ExamAnswerViewProps = {
  exam: IStudentExamData;
};

export function ExamAnswerView({ exam }: ExamAnswerViewProps) {
  const maxScore = exam.questions.reduce(
    (total, question) => total + question.points,
    0,
  );
  const isSubmitted = exam.submission?.status === "submitted";

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-bg-surface p-5">
        {isSubmitted ? (
          <>
            <Badge tone="success">Đã nộp</Badge>
            <p className="text-sm text-text-secondary">
              Điểm:{" "}
              <strong className="text-text-primary">
                {exam.submission?.score ?? 0}/{maxScore}
              </strong>
            </p>
            {exam.submission?.submittedAt && (
              <p className="text-sm text-text-secondary">
                Nộp lúc {formatDateTime(exam.submission.submittedAt)}
              </p>
            )}
          </>
        ) : (
          <>
            <Badge tone="warning">Đang làm · chưa nộp</Badge>
            <p className="text-sm text-text-secondary">
              Bài làm đã lưu nháp, bạn có thể tiếp tục nếu còn thời gian.
            </p>
          </>
        )}
      </section>

      {exam.questions.map((question, index) => (
        <article
          key={question.id}
          className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-text-primary">Câu {index + 1}</h2>
            <span className="text-sm text-text-secondary">
              {question.points} điểm
            </span>
            <span className="ml-auto">
              <QuestionResult question={question} />
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-text-primary">
            {formatQuestionContent(question.content)}
          </p>
          <div className="rounded-lg bg-bg-subtle p-3">
            <p className="mb-1 text-xs font-medium text-text-secondary">
              Bài làm của bạn
            </p>
            <AnswerValue question={question} />
          </div>
        </article>
      ))}
    </div>
  );
}
