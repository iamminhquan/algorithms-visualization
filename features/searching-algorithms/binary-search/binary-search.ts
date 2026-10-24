import type {
  IAlgorithmDefinition,
  IAlgorithmMetadata,
} from "@/engine/algorithm";
import { assertSearchInput } from "../validate";
import type {
  BinarySearchEvent,
  BinarySearchInput,
  BinarySearchResult,
  BinarySearchStep,
} from "./types";

export const BINARY_SEARCH_KEY = "binary-search";

const metadata: IAlgorithmMetadata<typeof BINARY_SEARCH_KEY> = Object.freeze({
  key: BINARY_SEARCH_KEY,
});

function executeBinarySearch(input: BinarySearchInput): BinarySearchResult {
  assertSearchInput(input);
  for (let i = 1; i < input.array.length; i++) {
    if (input.array[i - 1] > input.array[i]) {
      throw new RangeError(
        `Mảng chưa tăng dần: a[${i - 1}] = ${input.array[i - 1]} lớn hơn a[${i}] = ${input.array[i]}`,
      );
    }
  }

  const array = Object.freeze([...input.array]);
  const { target } = input;
  const events: BinarySearchEvent[] = [];
  let comparisons = 0;
  let low = 0;
  let high = array.length - 1;

  const record = (payload: BinarySearchStep, description: string) => {
    events.push(
      Object.freeze({
        description,
        payload: Object.freeze(payload),
        state: Object.freeze({ array, target, low, high }),
      }),
    );
  };

  record(
    { type: "init" },
    `Vùng tìm kiếm ban đầu là cả mảng: low = ${low}, high = ${high}`,
  );

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    record(
      { type: "pick-mid", mid },
      `Chọn phần tử giữa: mid = ⌊(${low} + ${high}) / 2⌋ = ${mid}`,
    );

    const value = array[mid];
    comparisons++;
    record(
      { type: "compare", mid },
      `So sánh a[${mid}] = ${value} với ${target}`,
    );

    if (value === target) {
      record(
        { type: "found", index: mid },
        `Tìm thấy ${target} tại vị trí ${mid} sau ${comparisons} lần so sánh`,
      );
      return { metadata, output: mid, events, metrics: { comparisons } };
    }

    if (value < target) {
      low = mid + 1;
      record(
        { type: "narrow", mid, keep: "right" },
        `${value} < ${target} nên bỏ nửa trái, low = ${low}`,
      );
    } else {
      high = mid - 1;
      record(
        { type: "narrow", mid, keep: "left" },
        `${value} > ${target} nên bỏ nửa phải, high = ${high}`,
      );
    }
  }

  record(
    { type: "not-found" },
    `low > high nên vùng tìm kiếm đã rỗng: không có ${target} (${comparisons} lần so sánh)`,
  );
  return { metadata, output: -1, events, metrics: { comparisons } };
}

export const binarySearch: IAlgorithmDefinition<
  BinarySearchInput,
  BinarySearchResult,
  typeof BINARY_SEARCH_KEY
> = Object.freeze({ metadata, execute: executeBinarySearch });
