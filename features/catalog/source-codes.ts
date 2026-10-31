import type { SourceCode } from "@/engine/visualization";
import { SEARCHING_SOURCE_CODES } from "@/features/searching-algorithms/source-codes";
import { SORTING_SOURCE_CODES } from "@/features/sorting-algorithms/source-codes";
import type { AlgorithmKey } from "./catalog";

const SOURCE_CODES = {
  ...SORTING_SOURCE_CODES,
  ...SEARCHING_SOURCE_CODES,
} satisfies Record<AlgorithmKey, SourceCode>;

const sourceCodesByKey = new Map<string, SourceCode>(
  Object.entries(SOURCE_CODES),
);

export function findSourceCode(key: string): SourceCode | undefined {
  return sourceCodesByKey.get(key);
}
