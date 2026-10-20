import { createRecorder } from "./recorder";
import type { SortingAlgorithm, Step, StepHistory } from "./types";

export function runAlgorithm(
  algorithm: SortingAlgorithm,
  input: readonly number[],
): StepHistory {
  const index = input.findIndex((value) => !Number.isFinite(value));
  if (index !== -1) {
    throw new TypeError(
      `Phần tử thứ ${index} của dữ liệu đầu vào không phải số hữu hạn: ${input[index]}`,
    );
  }

  const frozenInput = Object.freeze([...input]);
  const recorder = createRecorder(frozenInput);
  algorithm.sort(recorder.array);
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
