import { BUBBLE_SORT_KEY } from "./bubble-sort";
import type { SortingAlgorithm } from "./index";
import { SELECTION_SORT_KEY } from "./selection-sort";

/**
 * Độ phức tạp và tính chất của một thuật toán sắp xếp, dùng cho bảng so sánh.
 *
 * `bestTime`: Thời gian ở trường hợp tốt nhất, ví dụ "O(n)".
 * `averageTime`: Thời gian ở trường hợp trung bình.
 * `worstTime`: Thời gian ở trường hợp xấu nhất.
 * `space`: Bộ nhớ phụ ngoài mảng đầu vào.
 * `isStable`: Hai phần tử bằng nhau có giữ nguyên thứ tự ban đầu hay không.
 */
export interface ISortingComplexity {
  readonly bestTime: string;
  readonly averageTime: string;
  readonly worstTime: string;
  readonly space: string;
  readonly isStable: boolean;
}

/*
 * Khai báo bằng `satisfies Record<key, ...>` để thêm thuật toán sắp xếp mới mà quên bổ sung độ
 * phức tạp ở đây thì `tsc` báo lỗi. Bubble Sort có cờ dừng sớm nên trường hợp tốt nhất là O(n).
 */
const SORTING_COMPLEXITY = {
  [BUBBLE_SORT_KEY]: {
    bestTime: "O(n)",
    averageTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    isStable: true,
  },
  [SELECTION_SORT_KEY]: {
    bestTime: "O(n²)",
    averageTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    isStable: false,
  },
} satisfies Record<SortingAlgorithm["metadata"]["key"], ISortingComplexity>;

const COMPLEXITY_BY_KEY: ReadonlyMap<string, ISortingComplexity> = new Map(
  Object.entries(SORTING_COMPLEXITY),
);

/**
 * Tra độ phức tạp của thuật toán sắp xếp theo key đọc từ bảng `algorithms`.
 *
 * @param algorithmKey Key của thuật toán, ví dụ "bubble-sort".
 * @returns Độ phức tạp của thuật toán, hoặc `undefined` nếu key không thuộc nhóm sắp xếp.
 */
export function findSortingComplexity(
  algorithmKey: string,
): ISortingComplexity | undefined {
  return COMPLEXITY_BY_KEY.get(algorithmKey);
}
