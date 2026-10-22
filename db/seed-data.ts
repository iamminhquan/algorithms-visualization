import { BUBBLE_SORT_KEY } from "@/features/sorting-algorithms/bubble-sort";
import { SELECTION_SORT_KEY } from "@/features/sorting-algorithms/selection-sort";
import type { NewAlgorithm, NewCategory } from "./schema";

export const seedCategories = [
  {
    name: "Sắp xếp",
    slug: "sorting",
    description: "Các thuật toán sắp xếp mảng số theo thứ tự tăng dần.",
  },
  {
    name: "Cấu trúc dữ liệu",
    slug: "data-structures",
    description:
      "Mô phỏng tương tác cách danh sách liên kết, stack, queue và array lưu trữ và sắp xếp lại dữ liệu.",
  },
  {
    name: "Tìm kiếm",
    slug: "searching",
    description:
      "Theo dõi tìm kiếm tuyến tính và nhị phân truy tìm giá trị mục tiêu qua từng phép so sánh.",
  },
  {
    name: "Khái niệm cốt lõi",
    slug: "core-concepts",
    description:
      "Đi qua các ý tưởng nền tảng: lời gọi đệ quy rẽ nhánh và quy hoạch động tái sử dụng kết quả.",
  },
] as const satisfies readonly NewCategory[];

type CategorySlug = (typeof seedCategories)[number]["slug"];

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
