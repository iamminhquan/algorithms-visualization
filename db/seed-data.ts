import { CATEGORIES, type CategorySlug } from "@/features/catalog/categories";
import { BINARY_SEARCH_KEY } from "@/features/searching-algorithms/binary-search";
import { LINEAR_SEARCH_KEY } from "@/features/searching-algorithms/linear-search";
import { BUBBLE_SORT_KEY } from "@/features/sorting-algorithms/bubble-sort";
import { SELECTION_SORT_KEY } from "@/features/sorting-algorithms/selection-sort";
import type { NewAlgorithm, NewCategory } from "./schema";

/**
 * Trang chủ và footer đọc thẳng `CATEGORIES` mà không qua DB, nên seed lấy từ cùng nguồn đó
 * để tên và mô tả danh mục ở mọi trang luôn khớp nhau.
 */
export const seedCategories = CATEGORIES satisfies readonly NewCategory[];

export const seedAlgorithms: readonly (Omit<NewAlgorithm, "categoryId"> & {
  readonly categorySlug: CategorySlug;
})[] = [
  {
    key: BUBBLE_SORT_KEY,
    categorySlug: "sorting",
    name: "Sắp xếp nổi bọt (Bubble Sort)",
    slug: "bubble-sort",
    description:
      "So sánh từng cặp phần tử kề nhau và đổi chỗ nếu sai thứ tự; sau mỗi lượt, phần tử lớn nhất " +
      "còn lại nổi về cuối. Dừng sớm khi một lượt không có lần đổi chỗ nào.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
  {
    key: SELECTION_SORT_KEY,
    categorySlug: "sorting",
    name: "Sắp xếp chọn (Selection Sort)",
    slug: "selection-sort",
    description:
      "Ở mỗi lượt, duyệt đoạn chưa sắp xếp để tìm giá trị nhỏ nhất rồi đổi nó về đầu đoạn; " +
      "đoạn đã sắp xếp ở đầu mảng dài thêm một phần tử sau mỗi lượt.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
  {
    key: LINEAR_SEARCH_KEY,
    categorySlug: "searching",
    name: "Tìm kiếm tuyến tính (Linear Search)",
    slug: "linear-search",
    description:
      "Duyệt lần lượt từng phần tử từ đầu mảng và so sánh với giá trị cần tìm; dừng ngay khi gặp " +
      "phần tử bằng nó, hoặc báo không tìm thấy khi đã xét hết mảng. Không cần mảng có thứ tự.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
  },
  {
    key: BINARY_SEARCH_KEY,
    categorySlug: "searching",
    name: "Tìm kiếm nhị phân (Binary Search)",
    slug: "binary-search",
    description:
      "Trên mảng đã sắp xếp, so sánh giá trị cần tìm với phần tử ở giữa vùng đang xét rồi bỏ " +
      "nửa không thể chứa nó; mỗi bước vùng tìm kiếm còn một nửa, đến khi tìm thấy hoặc rỗng.",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
  },
];
