import { bubbleSort } from "./algorithms/sorting/bubble-sort";
import { selectionSort } from "./algorithms/sorting/selection-sort";
import { createAlgorithmRegistry } from "./engine";

const algorithmRegistry = createAlgorithmRegistry([bubbleSort, selectionSort]);

export const getAlgorithm = algorithmRegistry.get;
export const findAlgorithm = algorithmRegistry.find;
export const listAlgorithms = algorithmRegistry.list;
