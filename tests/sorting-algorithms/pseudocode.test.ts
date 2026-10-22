import { describe, expect, test } from "bun:test";
import type { IEventPayload } from "@/engine/algorithm";
import type { IPseudocode } from "@/engine/visualization";
import {
  BUBBLE_SORT_PSEUDOCODE,
  type BubbleSortStep,
  bubbleSort,
} from "@/features/sorting-algorithms/bubble-sort";
import {
  SELECTION_SORT_PSEUDOCODE,
  type SelectionSortStep,
  selectionSort,
} from "@/features/sorting-algorithms/selection-sort";

const SAMPLE_INPUTS: readonly (readonly number[])[] = [
  [],
  [7],
  [1, 2],
  [2, 1],
  [5, 3, 8, 1],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [3, 1, 3, 2, 1],
];

const BUBBLE_SORT_KEYWORDS: Readonly<Record<BubbleSortStep["type"], string>> = {
  compare: "nếu a[i] > a[i + 1]",
  swap: "hoán đổi",
  "mark-sorted": "đúng",
  complete: "hoàn tất",
};

const SELECTION_SORT_KEYWORDS: Readonly<
  Record<SelectionSortStep["type"], string>
> = {
  compare: "nếu a[j] < a[min]",
  swap: "hoán đổi",
  "mark-sorted": "đúng vị trí",
  complete: "hoàn tất",
};

/**
 * Mọi bước của mọi input mẫu phải trỏ tới một dòng có thật, và dòng ứng với mỗi loại bước
 * phải nói đúng thao tác đó.
 */
function expectEveryStepHasLine<TStep extends IEventPayload>(
  run: (input: readonly number[]) => readonly { readonly payload: TStep }[],
  pseudocode: IPseudocode<TStep>,
  keywordOf: (step: TStep) => string,
) {
  for (const input of SAMPLE_INPUTS) {
    for (const { payload } of run(input)) {
      const line = pseudocode.getActiveLine(payload);
      if (line === undefined) {
        throw new Error(`Bước "${payload.type}" không ứng với dòng nào`);
      }
      expect(pseudocode.lines[line]).toContain(keywordOf(payload));
    }
  }
}

describe("mã giả", () => {
  test("các dòng không trùng nhau vì panel dùng nội dung dòng làm key", () => {
    for (const { lines } of [
      BUBBLE_SORT_PSEUDOCODE,
      SELECTION_SORT_PSEUDOCODE,
    ]) {
      expect(new Set(lines).size).toBe(lines.length);
    }
  });

  test("Bubble Sort: mỗi bước tô đúng dòng của thao tác", () => {
    expectEveryStepHasLine(
      (input) => bubbleSort.execute(input).events,
      BUBBLE_SORT_PSEUDOCODE,
      (step) => BUBBLE_SORT_KEYWORDS[step.type],
    );
  });

  test("Bubble Sort: dừng sớm tô dòng dừng, cuối lượt tô dòng chốt phần tử cuối đoạn", () => {
    const sortedEvents = bubbleSort.execute([1, 2, 3]).events;
    const earlyStop = sortedEvents.find(
      (event) => event.payload.type === "mark-sorted",
    );
    expect(
      earlyStop && BUBBLE_SORT_PSEUDOCODE.getActiveLine(earlyStop.payload),
    ).toBe(4);

    const passEnd = bubbleSort
      .execute([3, 2, 1])
      .events.find((event) => event.payload.type === "mark-sorted");
    expect(
      passEnd && BUBBLE_SORT_PSEUDOCODE.getActiveLine(passEnd.payload),
    ).toBe(5);
  });

  test("Selection Sort: mỗi bước tô đúng dòng của thao tác", () => {
    expectEveryStepHasLine(
      (input) => selectionSort.execute(input).events,
      SELECTION_SORT_PSEUDOCODE,
      (step) => SELECTION_SORT_KEYWORDS[step.type],
    );
  });
});
