import { CATEGORIES, type CategorySlug } from "@/features/catalog/categories";
import { BUBBLE_SORT_KEY } from "@/features/sorting-algorithms/bubble-sort";
import { SELECTION_SORT_KEY } from "@/features/sorting-algorithms/selection-sort";
import type { NewAlgorithm, NewCategory } from "./schema";

/*
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
];
