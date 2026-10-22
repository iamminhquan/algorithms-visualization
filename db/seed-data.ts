import { BUBBLE_SORT_KEY } from "@/features/sorting-algorithms/bubble-sort";
import { SELECTION_SORT_KEY } from "@/features/sorting-algorithms/selection-sort";
import type { NewAlgorithm, NewCategory } from "./schema";

export const seedCategories = [
  {
    name: "Sắp xếp",
    slug: "sap-xep",
    description: "Các thuật toán sắp xếp mảng số theo thứ tự tăng dần.",
  },
] as const satisfies readonly NewCategory[];

type CategorySlug = (typeof seedCategories)[number]["slug"];

export const seedAlgorithms: readonly (Omit<NewAlgorithm, "categoryId"> & {
  readonly categorySlug: CategorySlug;
})[] = [
  {
    key: BUBBLE_SORT_KEY,
    categorySlug: "sap-xep",
    name: "Sắp xếp nổi bọt (Bubble Sort)",
    slug: "sap-xep-noi-bot",
    description:
      "So sánh từng cặp phần tử kề nhau và đổi chỗ nếu sai thứ tự; sau mỗi lượt, phần tử lớn nhất " +
      "còn lại nổi về cuối. Dừng sớm khi một lượt không có lần đổi chỗ nào.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
  {
    key: SELECTION_SORT_KEY,
    categorySlug: "sap-xep",
    name: "Sắp xếp chọn (Selection Sort)",
    slug: "sap-xep-chon",
    description:
      "Ở mỗi lượt, duyệt đoạn chưa sắp xếp để tìm giá trị nhỏ nhất rồi đổi nó về đầu đoạn; " +
      "đoạn đã sắp xếp ở đầu mảng dài thêm một phần tử sau mỗi lượt.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
];
