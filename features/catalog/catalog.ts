import { createAlgorithmRegistry } from "@/engine/algorithm";
import { SORTING_ALGORITHMS } from "@/features/sorting-algorithms";

const ALGORITHMS = [...SORTING_ALGORITHMS] as const;

const algorithmRegistry = createAlgorithmRegistry(ALGORITHMS);

export type AlgorithmKey = (typeof ALGORITHMS)[number]["metadata"]["key"];

export const getAlgorithm = algorithmRegistry.getAlgorithm;
export const findAlgorithm = algorithmRegistry.findAlgorithm;
export const listAlgorithmInfo = algorithmRegistry.listAlgorithmInfo;
