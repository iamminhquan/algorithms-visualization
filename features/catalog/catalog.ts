import { createAlgorithmRegistry } from "@/engine/algorithm";
import { SORTING_ALGORITHMS } from "@/features/sorting-algorithms";

const algorithmRegistry = createAlgorithmRegistry([...SORTING_ALGORITHMS]);

export const getAlgorithm = algorithmRegistry.getAlgorithm;
export const findAlgorithm = algorithmRegistry.findAlgorithm;
export const listAlgorithmInfo = algorithmRegistry.listAlgorithmInfo;
