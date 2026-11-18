import { io } from "next/cache";
import { getQuizBank } from "../quiz";
import { pickQuizSet } from "../quiz/pick";
import { AlgorithmQuizView } from "./algorithm-quiz-view";

type AlgorithmQuizProps = {
  readonly algorithmKey: string;
};

export async function AlgorithmQuiz({ algorithmKey }: AlgorithmQuizProps) {
  await io();
  const bank = getQuizBank(algorithmKey);
  if (!bank) {
    return null;
  }
  const questions = pickQuizSet(bank, 5);
  if (questions.length === 0) {
    return null;
  }
  return (
    <AlgorithmQuizView
      key={questions.map((question) => question.id).join("|")}
      questions={questions}
    />
  );
}

export function AlgorithmQuizSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-sm sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 rounded bg-bg-subtle" />
          <div className="h-6 w-32 rounded bg-bg-subtle" />
        </div>
        <div className="h-5 w-24 rounded bg-bg-subtle" />
      </div>
      <div className="mt-5 h-5 w-3/4 rounded bg-bg-subtle" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-12 rounded-xl bg-bg-subtle" />
        <div className="h-12 rounded-xl bg-bg-subtle" />
        <div className="h-12 rounded-xl bg-bg-subtle" />
      </div>
      <div className="mt-5 flex justify-end">
        <div className="h-9 w-24 rounded-lg bg-bg-subtle" />
      </div>
    </section>
  );
}
