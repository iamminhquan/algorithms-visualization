import {
  BINARY_SEARCH_LEGEND,
  BINARY_SEARCH_PSEUDOCODE,
  binarySearch,
  getBinarySearchFrame,
} from "../binary-search";
import {
  getLinearSearchFrame,
  LINEAR_SEARCH_LEGEND,
  LINEAR_SEARCH_PSEUDOCODE,
  linearSearch,
} from "../linear-search";
import { sortAscending } from "../search-input";
import { SearchingVisualizer } from "./searching-visualizer";

export function LinearSearchVisualizer() {
  return (
    <SearchingVisualizer
      algorithm={linearSearch}
      pseudocode={LINEAR_SEARCH_PSEUDOCODE}
      getFrame={getLinearSearchFrame}
      legend={LINEAR_SEARCH_LEGEND}
    />
  );
}

export function BinarySearchVisualizer() {
  return (
    <SearchingVisualizer
      algorithm={binarySearch}
      pseudocode={BINARY_SEARCH_PSEUDOCODE}
      getFrame={getBinarySearchFrame}
      legend={BINARY_SEARCH_LEGEND}
      normalize={sortAscending}
      inputHint="Tìm kiếm nhị phân chỉ chạy trên mảng tăng dần, nên dữ liệu nhập vào được tự sắp xếp."
    />
  );
}
