import { bubbleSort } from "./algorithms/sorting/bubble-sort";
import { createAlgorithmRegistry } from "./engine";

export const algorithmRegistry = createAlgorithmRegistry([bubbleSort]);

export const getAlgorithm = algorithmRegistry.get;
export const findAlgorithm = algorithmRegistry.find;
export const listAlgorithms = algorithmRegistry.list;
