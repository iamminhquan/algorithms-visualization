import { interchangeSort } from "./algorithms/interchange-sort";
import type { SortingAlgorithm } from "./types";

export const algorithms: readonly SortingAlgorithm[] = [interchangeSort];

export function getAlgorithm(slug: string): SortingAlgorithm | undefined {
  return algorithms.find((algorithm) => algorithm.slug === slug);
}
