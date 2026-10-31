import type { SourceCode } from "@/engine/visualization";
import { BINARY_SEARCH_KEY, BINARY_SEARCH_SOURCE_CODE } from "./binary-search";
import type { SearchingAlgorithm } from "./index";
import { LINEAR_SEARCH_KEY, LINEAR_SEARCH_SOURCE_CODE } from "./linear-search";

export const SEARCHING_SOURCE_CODES = {
  [LINEAR_SEARCH_KEY]: LINEAR_SEARCH_SOURCE_CODE,
  [BINARY_SEARCH_KEY]: BINARY_SEARCH_SOURCE_CODE,
} satisfies Record<SearchingAlgorithm["metadata"]["key"], SourceCode>;
