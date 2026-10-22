import { createAlgorithmRegistry } from "@/engine/algorithm";
import { bubbleSort } from "./algorithms/sorting/bubble-sort";
import { selectionSort } from "./algorithms/sorting/selection-sort";

const algorithmRegistry = createAlgorithmRegistry([bubbleSort, selectionSort]);

export const getAlgorithm = algorithmRegistry.getAlgorithm;
export const findAlgorithm = algorithmRegistry.findAlgorithm;
export const listAlgorithmInfo = algorithmRegistry.listAlgorithmInfo;
