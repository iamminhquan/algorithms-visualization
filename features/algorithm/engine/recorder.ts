import {
  compareMessage,
  doneMessage,
  initMessage,
  markSortedMessage,
  swapMessage,
} from "./messages";
import type { BarState, Step, StepAction, TrackedArray } from "./types";

export function createRecorder(input: readonly number[]): {
  array: TrackedArray;
  finish(): readonly Step[];
} {
  const working = [...input];
  const length = working.length;
  const sorted = new Set<number>();
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  let finished = false;

  const assertIndex = (index: number): void => {
    if (!Number.isInteger(index) || index < 0 || index >= length) {
      throw new RangeError(`Chỉ số ${index} nằm ngoài phạm vi [0, ${length})`);
    }
  };

  const record = (
    action: StepAction,
    indices: readonly number[],
    activeState: BarState,
    message: string,
    allSorted = false,
  ): void => {
    const states: BarState[] = working.map((_, i) =>
      allSorted || sorted.has(i) ? "sorted" : "default",
    );
    for (const i of indices) {
      states[i] = activeState;
    }
    steps.push(
      Object.freeze({
        index: steps.length,
        action,
        array: Object.freeze([...working]),
        states: Object.freeze(states),
        indices: Object.freeze([...indices]),
        message,
        comparisons,
        swaps,
      }),
    );
  };

  record("init", [], "default", initMessage(length));

  const array: TrackedArray = {
    length,
    get(index) {
      assertIndex(index);
      return working[index];
    },
    compare(i, j, message) {
      assertIndex(i);
      assertIndex(j);
      comparisons++;
      record(
        "compare",
        [i, j],
        "comparing",
        message ?? compareMessage(working, i, j),
      );
      return working[i] - working[j];
    },
    swap(i, j, message) {
      assertIndex(i);
      assertIndex(j);
      const text = message ?? swapMessage(working, i, j);
      [working[i], working[j]] = [working[j], working[i]];
      swaps++;
      record("swap", [i, j], "swapping", text);
    },
    markSorted(index, message) {
      assertIndex(index);
      sorted.add(index);
      record(
        "mark-sorted",
        [index],
        "sorted",
        message ?? markSortedMessage(working, index),
      );
    },
  };

  return {
    array,
    finish() {
      if (!finished) {
        finished = true;
        record("done", [], "sorted", doneMessage(comparisons, swaps), true);
      }
      return steps;
    },
  };
}
