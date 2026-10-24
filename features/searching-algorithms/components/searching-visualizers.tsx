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

/*
 * `SearchingVisualizer` là component generic theo kiểu sự kiện, mà `lazy()` làm mất tham số kiểu
 * đó. Vì vậy từng thuật toán được gắn sẵn ở đây, rồi `visualizers.tsx` tải lười các component này.
 */

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
