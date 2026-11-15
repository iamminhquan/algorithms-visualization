"use client";

import { Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Exercise = {
  prompt: string;
  options: readonly string[];
  answer: number;
  explanation: string;
};

const EXERCISES: Record<string, Exercise> = {
  "bubble-sort": {
    prompt:
      "Sau một lượt duyệt Bubble Sort tăng dần, phần tử nào chắc chắn ở đúng vị trí cuối cùng?",
    options: ["Phần tử nhỏ nhất", "Phần tử lớn nhất", "Phần tử ở giữa"],
    answer: 1,
    explanation:
      "Mỗi cặp kề nhau được đổi chỗ khi sai thứ tự, nên phần tử lớn nhất nổi về cuối mảng.",
  },
  "selection-sort": {
    prompt: "Selection Sort làm gì ở đầu mỗi lượt?",
    options: [
      "Tìm phần tử nhỏ nhất của đoạn chưa sắp xếp",
      "Đổi mọi cặp phần tử kề nhau",
      "Chia mảng thành hai nửa",
    ],
    answer: 0,
    explanation:
      "Thuật toán chọn phần tử nhỏ nhất còn lại rồi đổi nó với vị trí đầu đoạn chưa sắp xếp.",
  },
  "insertion-sort": {
    prompt:
      "Khi chèn một phần tử vào đoạn đã sắp xếp, các phần tử lớn hơn nó sẽ được làm gì?",
    options: ["Bỏ qua", "Dịch sang phải", "Đổi với phần tử cuối mảng"],
    answer: 1,
    explanation:
      "Các phần tử lớn hơn được dịch sang phải để tạo chỗ cho phần tử đang chèn.",
  },
  "merge-sort": {
    prompt: "Merge Sort kết hợp hai nửa đã sắp xếp bằng cách nào?",
    options: [
      "Chọn lần lượt phần tử nhỏ hơn ở đầu mỗi nửa",
      "Đảo ngược cả hai nửa",
      "Tìm pivot rồi phân hoạch",
    ],
    answer: 0,
    explanation:
      "Bước merge so sánh hai đầu hiện tại và đưa phần tử nhỏ hơn vào mảng kết quả.",
  },
  "quick-sort": {
    prompt: "Trong Quick Sort, pivot được dùng để làm gì?",
    options: [
      "Chia phần tử thành nhóm nhỏ hơn và lớn hơn pivot",
      "Tìm phần tử đầu tiên",
      "Ghép hai mảng đã sắp xếp",
    ],
    answer: 0,
    explanation:
      "Partition đưa các phần tử nhỏ hơn về một phía và lớn hơn về phía còn lại của pivot.",
  },
  "linear-search": {
    prompt: "Linear Search kiểm tra phần tử theo cách nào?",
    options: [
      "Lần lượt từ đầu đến khi tìm thấy hoặc hết mảng",
      "Chỉ kiểm tra phần tử giữa",
      "Sắp xếp mảng trước",
    ],
    answer: 0,
    explanation:
      "Linear Search duyệt tuần tự từng phần tử, nên không yêu cầu mảng đã sắp xếp.",
  },
  "binary-search": {
    prompt: "Điều kiện cần để Binary Search hoạt động đúng là gì?",
    options: [
      "Mảng đã được sắp xếp",
      "Mảng có số phần tử chẵn",
      "Mảng không có số âm",
    ],
    answer: 0,
    explanation:
      "Thuật toán loại bỏ nửa vùng tìm kiếm dựa trên thứ tự, vì vậy dữ liệu phải được sắp xếp.",
  },
};

type AlgorithmExerciseProps = {
  algorithmKey: string;
};

export function AlgorithmExercise({ algorithmKey }: AlgorithmExerciseProps) {
  const exercise = EXERCISES[algorithmKey];
  const [selected, setSelected] = useState<number | null>(null);

  if (!exercise) return null;

  const isCorrect = selected === exercise.answer;

  return (
    <section
      aria-labelledby="exercise-title"
      className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-sm sm:p-7"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent-text">Đến lượt bạn</p>
          <h2
            id="exercise-title"
            className="mt-1 text-xl font-semibold tracking-tight text-text-primary"
          >
            Thử sức với câu hỏi nhỏ
          </h2>
        </div>
        <Link
          href="/learning"
          className="text-sm font-medium text-accent-text underline-offset-4 hover:underline"
        >
          Khám phá bài học →
        </Link>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-4 text-base font-medium text-text-primary">
          {exercise.prompt}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {exercise.options.map((option, index) => {
            const chosen = selected === index;
            const revealedCorrect =
              selected !== null && index === exercise.answer;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  if (selected !== exercise.answer) {
                    setSelected(index);
                  }
                }}
                disabled={isCorrect}
                aria-pressed={chosen}
                className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-default disabled:cursor-default ${revealedCorrect ? "border-emerald-700 bg-success-subtle text-success-text" : chosen ? "border-danger-default bg-danger-subtle text-danger-text" : "border-border-default bg-bg-page text-text-primary hover:border-border-strong"}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      {selected !== null && (
        <div
          aria-live="polite"
          className={`mt-4 flex items-start gap-3 rounded-xl p-4 text-sm ${isCorrect ? "bg-success-subtle text-success-text" : "bg-danger-subtle text-danger-text"}`}
        >
          {isCorrect ? (
            <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <X aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {isCorrect ? "Chính xác!" : "Chưa đúng, thử lại nhé."}
            </p>
            <p className="mt-1">{exercise.explanation}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Làm lại câu hỏi"
            className="rounded-md p-1 hover:bg-black/5"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
