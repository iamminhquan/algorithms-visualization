import { createRecorder } from "./recorder";
import type { SortingAlgorithm, Step, StepHistory } from "./types";

// Bộ nhớ lịch sử tăng ~n³ nên cần giới hạn độ dài đầu vào.
export const MAX_INPUT_LENGTH = 100;

const isThenable = (value: unknown): boolean =>
  (typeof value === "object" || typeof value === "function") &&
  value !== null &&
  typeof (value as { then?: unknown }).then === "function";

export function runAlgorithm(
  algorithm: SortingAlgorithm,
  input: readonly number[],
): StepHistory {
  if (input.length > MAX_INPUT_LENGTH) {
    throw new RangeError(
      `Dữ liệu đầu vào có ${input.length} phần tử, vượt quá giới hạn ${MAX_INPUT_LENGTH}`,
    );
  }
  const index = input.findIndex((value) => !Number.isFinite(value));
  if (index !== -1) {
    throw new TypeError(
      `Phần tử thứ ${index} của dữ liệu đầu vào không phải số hữu hạn: ${input[index]}`,
    );
  }

  const frozenInput = Object.freeze([...input]);
  const recorder = createRecorder(frozenInput);
  const result: unknown = algorithm.sort(recorder.array);
  if (isThenable(result)) {
    throw new TypeError(
      "Thuật toán phải chạy đồng bộ, không được trả về Promise",
    );
  }
  const steps = Object.freeze([...recorder.finish()]);

  return Object.freeze({
    slug: algorithm.slug,
    input: frozenInput,
    steps,
  });
}

export function getStep(history: StepHistory, index: number): Step {
  if (!Number.isInteger(index) || index < 0 || index >= history.steps.length) {
    throw new RangeError(
      `Bước ${index} nằm ngoài phạm vi [0, ${history.steps.length})`,
    );
  }
  return history.steps[index];
}
