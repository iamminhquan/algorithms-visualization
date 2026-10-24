import { binarySearch } from "./binary-search";
import { linearSearch } from "./linear-search";

export const SEARCHING_ALGORITHMS = [linearSearch, binarySearch] as const;

export type SearchingAlgorithm = (typeof SEARCHING_ALGORITHMS)[number];
