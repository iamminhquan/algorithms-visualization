import { describe, expect, test } from "bun:test";
import {
  createStepContext,
  formatStepLabel,
  MAX_CONTEXT_LENGTH,
} from "@/engine/assistant";
import { DEFAULT_ARRAY } from "@/engine/visualization";
import { parseAssistantContext } from "@/features/assistant/validate-context";
import {
  BINARY_SEARCH_PSEUDOCODE,
  binarySearch,
} from "@/features/searching-algorithms/binary-search";
import { MAX_ARRAY_LENGTH } from "@/features/sorting-algorithms/array-input";
import {
  BUBBLE_SORT_PSEUDOCODE,
  bubbleSort,
} from "@/features/sorting-algorithms/bubble-sort";

describe("createStepContext", () => {
  const { events } = bubbleSort.execute(DEFAULT_ARRAY);

  test("chụp đúng sự kiện, dòng mã giả và chỉ số của bước được chọn", () => {
    const index = events.findIndex((event) => event.payload.type === "swap");
    const event = events[index];
    const context = createStepContext({
      algorithmKey: bubbleSort.metadata.key,
      input: DEFAULT_ARRAY,
      events,
      index,
      pseudocode: BUBBLE_SORT_PSEUDOCODE,
      metrics: [{ label: "Hoán đổi", value: 1 }],
    });
    expect(context).toEqual({
      algorithmKey: "bubble-sort",
      input: DEFAULT_ARRAY,
      step: {
        index,
        total: events.length,
        description: event?.description ?? "",
        payload: event?.payload ?? { type: "" },
        state: event?.state,
      },
      pseudocode: BUBBLE_SORT_PSEUDOCODE.lines,
      activeLine: 3,
      metrics: [{ label: "Hoán đổi", value: 1 }],
    });
  });

  test("chỉ số bước nằm ngoài vết thì trả undefined", () => {
    expect(
      createStepContext({
        algorithmKey: "bubble-sort",
        input: DEFAULT_ARRAY,
        events,
        index: events.length,
        pseudocode: BUBBLE_SORT_PSEUDOCODE,
        metrics: [],
      }),
    ).toBeUndefined();
  });

  test("nhãn bước đếm từ 1 giống thanh điều khiển", () => {
    const context = createStepContext({
      algorithmKey: "bubble-sort",
      input: DEFAULT_ARRAY,
      events,
      index: 0,
      pseudocode: BUBBLE_SORT_PSEUDOCODE,
      metrics: [],
    });
    expect(context && formatStepLabel(context)).toBe(`Bước 1/${events.length}`);
  });

  test("ngữ cảnh lớn nhất của mọi bước sắp xếp và tìm kiếm vẫn qua được bộ kiểm tra máy chủ", () => {
    const longest = Array.from(
      { length: MAX_ARRAY_LENGTH },
      (_, i) => 999 - i * 37,
    );
    const sortRun = bubbleSort.execute(longest);
    const sorted = [...longest].sort((a, b) => a - b);
    const searchRun = binarySearch.execute({ array: sorted, target: -1 });
    const cases = [
      ...sortRun.events.map((_, index) =>
        createStepContext({
          algorithmKey: bubbleSort.metadata.key,
          input: longest,
          events: sortRun.events,
          index,
          pseudocode: BUBBLE_SORT_PSEUDOCODE,
          metrics: [
            { label: "So sánh", value: 999 },
            { label: "Hoán đổi", value: 999 },
          ],
        }),
      ),
      ...searchRun.events.map((_, index) =>
        createStepContext({
          algorithmKey: binarySearch.metadata.key,
          input: { array: sorted, target: -1 },
          events: searchRun.events,
          index,
          pseudocode: BINARY_SEARCH_PSEUDOCODE,
          metrics: [{ label: "So sánh", value: 99 }],
        }),
      ),
    ];
    for (const context of cases) {
      expect(context).toBeDefined();
      const parsed = parseAssistantContext(JSON.parse(JSON.stringify(context)));
      expect(parsed.type).toBe("valid");
      expect(JSON.stringify(context).length).toBeLessThan(MAX_CONTEXT_LENGTH);
    }
  });
});
