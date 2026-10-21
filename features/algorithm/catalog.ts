import { bubbleSort } from "./algorithms/sorting/bubble-sort";
import { selectionSort } from "./algorithms/sorting/selection-sort";
import { createAlgorithmRegistry } from "./engine";

const algorithmRegistry = createAlgorithmRegistry([bubbleSort, selectionSort]);

export const getAlgorithm = algorithmRegistry.getAlgorithm;
export const findAlgorithm = algorithmRegistry.findAlgorithm;
export const listAlgorithmInfo = algorithmRegistry.listAlgorithmInfo;
