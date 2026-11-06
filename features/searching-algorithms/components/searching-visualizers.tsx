import type { IAlgorithmCodeContent } from "@/features/catalog/code-content";
import {
  BINARY_SEARCH_LEGEND,
  binarySearch,
  getBinarySearchActiveLine,
  getBinarySearchFrame,
  getBinarySearchVariables,
} from "../binary-search";
import {
  getLinearSearchActiveLine,
  getLinearSearchFrame,
  getLinearSearchVariables,
  LINEAR_SEARCH_LEGEND,
  linearSearch,
} from "../linear-search";
import { sortAscending } from "../search-input";
import { SearchingVisualizer } from "./searching-visualizer";

export function LinearSearchVisualizer({
  pseudocode,
  sourceCode,
}: IAlgorithmCodeContent) {
  return (
    <SearchingVisualizer
      algorithm={linearSearch}
      pseudocode={{
        lines: pseudocode,
        getActiveLine: getLinearSearchActiveLine,
      }}
      sourceCode={sourceCode}
      getFrame={getLinearSearchFrame}
      getVariables={getLinearSearchVariables}
      legend={LINEAR_SEARCH_LEGEND}
    />
  );
}

export function BinarySearchVisualizer({
  pseudocode,
  sourceCode,
}: IAlgorithmCodeContent) {
  return (
    <SearchingVisualizer
      algorithm={binarySearch}
      pseudocode={{
        lines: pseudocode,
        getActiveLine: getBinarySearchActiveLine,
      }}
      sourceCode={sourceCode}
      getFrame={getBinarySearchFrame}
      getVariables={getBinarySearchVariables}
      legend={BINARY_SEARCH_LEGEND}
      normalize={sortAscending}
      inputHint="Tìm kiếm nhị phân chỉ chạy trên mảng tăng dần, nên dữ liệu nhập vào được tự sắp xếp."
    />
  );
}
