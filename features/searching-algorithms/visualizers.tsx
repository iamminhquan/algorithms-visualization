import { type ComponentType, lazy } from "react";
import { BINARY_SEARCH_KEY } from "./binary-search";
import type { SearchingAlgorithm } from "./index";
import { LINEAR_SEARCH_KEY } from "./linear-search";

/*
 * Tải lười để trang của danh mục khác không phải tải code mô phỏng tìm kiếm. Hai thuật toán nằm
 * chung một module nên chỉ tải một lần.
 */
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

/**
 * Trình mô phỏng của từng thuật toán tìm kiếm, tra theo `metadata.key`. Phải render bên trong
 * `<Suspense>` vì component được tải lười.
 */
export const SEARCHING_VISUALIZERS = {
  [LINEAR_SEARCH_KEY]: LinearSearchVisualizer,
  [BINARY_SEARCH_KEY]: BinarySearchVisualizer,
} satisfies Record<SearchingAlgorithm["metadata"]["key"], ComponentType>;
