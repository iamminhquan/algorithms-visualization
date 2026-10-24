import { describe, expect, test } from "bun:test";
import {
  BINARY_SEARCH_PSEUDOCODE,
  type BinarySearchStep,
  binarySearch,
} from "@/features/searching-algorithms/binary-search";
import {
  LINEAR_SEARCH_PSEUDOCODE,
  type LinearSearchStep,
  linearSearch,
} from "@/features/searching-algorithms/linear-search";

const SORTED_ARRAYS: readonly (readonly number[])[] = [
  [],
  [7],
  [1, 3],
  [1, 3, 5, 8],
  [2, 2, 2],
];

const LINEAR_SEARCH_KEYWORDS: Readonly<
  Record<LinearSearchStep["type"], string>
> = {
  compare: "if a[i] == key",
  found: "found",
  "not-found": "not found",
};

function getBinaryKeyword(step: BinarySearchStep): string {
  switch (step.type) {
    case "init":
      return "low = 0";
    case "pick-mid":
      return "mid =";
    case "compare":
      return "if a[mid] == key";
    case "found":
      return "found";
    case "narrow":
      return step.keep === "right" ? "low = mid + 1" : "high = mid - 1";
    case "not-found":
      return "not found";
    default: {
      const unreachable: never = step;
      throw new Error(`Bước không hợp lệ: ${JSON.stringify(unreachable)}`);
    }
  }
}

describe("mã giả tìm kiếm", () => {
  test("các dòng không trùng nhau vì panel dùng nội dung dòng làm key", () => {
    for (const { lines } of [
      LINEAR_SEARCH_PSEUDOCODE,
      BINARY_SEARCH_PSEUDOCODE,
    ]) {
      expect(new Set(lines).size).toBe(lines.length);
      expect(lines.at(-1)).toBe("done");
    }
  });

  test("Linear Search: mỗi bước tô đúng dòng của thao tác", () => {
    for (const array of SORTED_ARRAYS) {
      for (const target of [...array, 100]) {
        for (const { payload } of linearSearch.execute({ array, target })
          .events) {
          const line = LINEAR_SEARCH_PSEUDOCODE.getActiveLine(payload);
          expect(line).toBeDefined();
          expect(LINEAR_SEARCH_PSEUDOCODE.lines[line ?? -1]).toContain(
            LINEAR_SEARCH_KEYWORDS[payload.type],
          );
        }
      }
    }
  });

  test("Binary Search: mỗi bước tô đúng dòng của thao tác", () => {
    for (const array of SORTED_ARRAYS) {
      for (const target of [...array, 0, 100]) {
        for (const { payload } of binarySearch.execute({ array, target })
          .events) {
          const line = BINARY_SEARCH_PSEUDOCODE.getActiveLine(payload);
          expect(line).toBeDefined();
          expect(BINARY_SEARCH_PSEUDOCODE.lines[line ?? -1]).toContain(
            getBinaryKeyword(payload),
          );
        }
      }
    }
  });
});
