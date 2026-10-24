import type {
  IAlgorithmDefinition,
  IAlgorithmMetadata,
} from "@/engine/algorithm";
import { assertSearchInput } from "../validate";
import type {
  LinearSearchEvent,
  LinearSearchInput,
  LinearSearchResult,
  LinearSearchStep,
} from "./types";

export const LINEAR_SEARCH_KEY = "linear-search";

const metadata: IAlgorithmMetadata<typeof LINEAR_SEARCH_KEY> = Object.freeze({
  key: LINEAR_SEARCH_KEY,
});

function executeLinearSearch(input: LinearSearchInput): LinearSearchResult {
  assertSearchInput(input);

  const array = Object.freeze([...input.array]);
  const { target } = input;
  const high = array.length - 1;
  const events: LinearSearchEvent[] = [];
  let comparisons = 0;
  let low = 0;

  const record = (payload: LinearSearchStep, description: string) => {
    events.push(
      Object.freeze({
        description,
        payload: Object.freeze(payload),
        state: Object.freeze({ array, target, low, high }),
      }),
    );
  };

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    const isMatch = value === target;

    comparisons++;
    if (!isMatch) {
      low = i + 1;
    }
    record(
      { type: "compare", index: i },
      isMatch
        ? `So sánh a[${i}] = ${value} với ${target}: bằng nhau`
        : `So sánh a[${i}] = ${value} với ${target}: khác nhau, xét phần tử kế tiếp`,
    );

    if (isMatch) {
      record(
        { type: "found", index: i },
        `Tìm thấy ${target} tại vị trí ${i} sau ${comparisons} lần so sánh`,
      );
      return { metadata, output: i, events, metrics: { comparisons } };
    }
  }

  record(
    { type: "not-found" },
    `Đã xét hết mảng, không có ${target} (${comparisons} lần so sánh)`,
  );
  return { metadata, output: -1, events, metrics: { comparisons } };
}

export const linearSearch: IAlgorithmDefinition<
  LinearSearchInput,
  LinearSearchResult,
  typeof LINEAR_SEARCH_KEY
> = Object.freeze({ metadata, execute: executeLinearSearch });
