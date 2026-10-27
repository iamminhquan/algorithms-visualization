import { type ComponentType, lazy } from "react";
import { BINARY_SEARCH_KEY } from "./binary-search";
import type { SearchingAlgorithm } from "./index";
import { LINEAR_SEARCH_KEY } from "./linear-search";

const loadVisualizers = () => import("./components/searching-visualizers");

const LinearSearchVisualizer = lazy(() =>
  loadVisualizers().then((module) => ({
    default: module.LinearSearchVisualizer,
  })),
);

const BinarySearchVisualizer = lazy(() =>
  loadVisualizers().then((module) => ({
    default: module.BinarySearchVisualizer,
  })),
);

export const SEARCHING_VISUALIZERS = {
  [LINEAR_SEARCH_KEY]: LinearSearchVisualizer,
  [BINARY_SEARCH_KEY]: BinarySearchVisualizer,
} satisfies Record<SearchingAlgorithm["metadata"]["key"], ComponentType>;
