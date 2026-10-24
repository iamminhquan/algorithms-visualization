import { BINARY_SEARCH_KEY } from "./binary-search";
import type { SearchingAlgorithm } from "./index";
import { LINEAR_SEARCH_KEY } from "./linear-search";

/**
 * Độ phức tạp và yêu cầu đầu vào của một thuật toán tìm kiếm, dùng cho bảng so sánh.
 *
 * `bestTime`: Thời gian ở trường hợp tốt nhất, ví dụ "O(1)" khi phần tử đầu tiên được xét đã là key.
 * `averageTime`: Thời gian ở trường hợp trung bình.
 * `worstTime`: Thời gian ở trường hợp xấu nhất, gồm cả khi không tìm thấy.
 * `space`: Bộ nhớ phụ ngoài mảng đầu vào.
 * `requiresSorted`: Mảng đầu vào có phải được sắp xếp trước hay không.
 */
export interface ISearchingComplexity {
  readonly bestTime: string;
  readonly averageTime: string;
  readonly worstTime: string;
  readonly space: string;
  readonly requiresSorted: boolean;
}

/*
 * Khai báo bằng `satisfies Record<key, ...>` để thêm thuật toán tìm kiếm mới mà quên bổ sung độ
 * phức tạp ở đây thì `tsc` báo lỗi. Binary Search cài đặt bằng vòng lặp chứ không đệ quy, nên bộ
 * nhớ phụ là O(1).
 */
const SEARCHING_COMPLEXITY = {
  [LINEAR_SEARCH_KEY]: {
    bestTime: "O(1)",
    averageTime: "O(n)",
    worstTime: "O(n)",
    space: "O(1)",
    requiresSorted: false,
  },
  [BINARY_SEARCH_KEY]: {
    bestTime: "O(1)",
    averageTime: "O(log n)",
    worstTime: "O(log n)",
    space: "O(1)",
    requiresSorted: true,
  },
} satisfies Record<SearchingAlgorithm["metadata"]["key"], ISearchingComplexity>;

const COMPLEXITY_BY_KEY: ReadonlyMap<string, ISearchingComplexity> = new Map(
  Object.entries(SEARCHING_COMPLEXITY),
);

/**
 * Tra độ phức tạp của thuật toán tìm kiếm theo key đọc từ bảng `algorithms`.
 *
 * @param algorithmKey Key của thuật toán, ví dụ "binary-search".
 * @returns Độ phức tạp của thuật toán, hoặc `undefined` nếu key không thuộc nhóm tìm kiếm.
 */
export function findSearchingComplexity(
  algorithmKey: string,
): ISearchingComplexity | undefined {
  return COMPLEXITY_BY_KEY.get(algorithmKey);
}
