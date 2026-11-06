import { describe, expect, test } from "bun:test";
import type { IEventPayload } from "@/engine/algorithm";
import {
  type BubbleSortStep,
  bubbleSort,
  getBubbleSortActiveLine,
} from "@/features/sorting-algorithms/bubble-sort";
import {
  getSelectionSortActiveLine,
  type SelectionSortStep,
  selectionSort,
} from "@/features/sorting-algorithms/selection-sort";
import { getSeedPseudocodeLines } from "../helpers/seed-snippets";

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

const BUBBLE_SORT_LINES = getSeedPseudocodeLines("bubble-sort");
const SELECTION_SORT_LINES = getSeedPseudocodeLines("selection-sort");
const QUICK_SORT_LINES = getSeedPseudocodeLines("quick-sort");
const MERGE_SORT_LINES = getSeedPseudocodeLines("merge-sort");

const BUBBLE_SORT_KEYWORDS: Readonly<Record<BubbleSortStep["type"], string>> = {
  compare: "nếu a[i] > a[i + 1]",
  swap: "hoán đổi",
  "mark-sorted": "đúng",
  complete: "kết thúc",
};

const SELECTION_SORT_KEYWORDS: Readonly<
  Record<SelectionSortStep["type"], string>
> = {
  compare: "nếu a[j] < a[min]",
  swap: "hoán đổi",
  "mark-sorted": "đúng vị trí",
  complete: "kết thúc",
};

function expectEveryStepHasLine<TStep extends IEventPayload>(
  run: (input: readonly number[]) => readonly {
    readonly payload: TStep;
  }[],
  getActiveLine: (step: TStep) => number | undefined,
  lines: readonly string[],
  keywordOf: (step: TStep) => string,
) {
  for (const input of SAMPLE_INPUTS) {
    for (const { payload } of run(input)) {
      const line = getActiveLine(payload);
      if (line === undefined) {
        throw new Error(`Bước "${payload.type}" không ứng với dòng nào`);
      }
      expect(lines[line]).toContain(keywordOf(payload));
    }
  }
}

describe("mã giả", () => {
  test("các dòng không trùng nhau vì panel dùng nội dung dòng làm key", () => {
    for (const lines of [
      BUBBLE_SORT_LINES,
      SELECTION_SORT_LINES,
      QUICK_SORT_LINES,
      MERGE_SORT_LINES,
    ]) {
      expect(new Set(lines).size).toBe(lines.length);
    }
  });

  test("Bubble Sort: mỗi bước tô đúng dòng của thao tác", () => {
    expectEveryStepHasLine(
      (input) => bubbleSort.execute(input).events,
      getBubbleSortActiveLine,
      BUBBLE_SORT_LINES,
      (step) => BUBBLE_SORT_KEYWORDS[step.type],
    );
  });

  test("Bubble Sort: dừng sớm tô dòng dừng, cuối lượt tô dòng chốt phần tử cuối đoạn", () => {
    const sortedEvents = bubbleSort.execute([1, 2, 3]).events;
    const earlyStop = sortedEvents.find(
      (event) => event.payload.type === "mark-sorted",
    );
    expect(earlyStop && getBubbleSortActiveLine(earlyStop.payload)).toBe(4);

    const passEnd = bubbleSort
      .execute([3, 2, 1])
      .events.find((event) => event.payload.type === "mark-sorted");
    expect(passEnd && getBubbleSortActiveLine(passEnd.payload)).toBe(5);
  });

  test("Selection Sort: mỗi bước tô đúng dòng của thao tác", () => {
    expectEveryStepHasLine(
      (input) => selectionSort.execute(input).events,
      getSelectionSortActiveLine,
      SELECTION_SORT_LINES,
      (step) => SELECTION_SORT_KEYWORDS[step.type],
    );
  });
});
