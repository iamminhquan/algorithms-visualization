import { BINARY_SEARCH_KEY } from "@/features/searching-algorithms/binary-search";
import { LINEAR_SEARCH_KEY } from "@/features/searching-algorithms/linear-search";
import { BUBBLE_SORT_KEY } from "@/features/sorting-algorithms/bubble-sort";
import { INSERTION_SORT_KEY } from "@/features/sorting-algorithms/insertion-sort";
import { MERGE_SORT_KEY } from "@/features/sorting-algorithms/merge-sort";
import { QUICK_SORT_KEY } from "@/features/sorting-algorithms/quick-sort";
import { SELECTION_SORT_KEY } from "@/features/sorting-algorithms/selection-sort";
import type {
  NewAlgorithm,
  NewAlgorithmComplexity,
  NewCategory,
} from "./schema";
import categoriesData from "./seed-data/categories.json";
import complexitiesData from "./seed-data/complexities.json";

export const seedCategories = categoriesData satisfies readonly NewCategory[];

export const seedAlgorithms: readonly (Omit<NewAlgorithm, "categoryId"> & {
  readonly categorySlug: string;
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
    key: INSERTION_SORT_KEY,
    categorySlug: "sorting",
    name: "Sắp xếp chèn (Insertion Sort)",
    slug: "insertion-sort",
    description:
      "Lấy lần lượt từng phần tử rồi đổi chỗ nó với phần tử kề bên trái chừng nào phần tử đó còn " +
      "lớn hơn, nhờ vậy đoạn đầu mảng luôn đã sắp xếp; mảng gần đúng thứ tự chỉ tốn khoảng n lần so sánh.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
  {
    key: QUICK_SORT_KEY,
    categorySlug: "sorting",
    name: "Sắp xếp nhanh (Quick Sort)",
    slug: "quick-sort",
    description:
      "Chọn phần tử cuối đoạn làm pivot, dồn các phần tử nhỏ hơn hoặc bằng pivot sang trái rồi đặt " +
      "pivot vào giữa, sau đó sắp xếp đệ quy hai phần hai bên; trung bình O(n log n), xấu nhất O(n²).",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(log n)",
  },
  {
    key: MERGE_SORT_KEY,
    categorySlug: "sorting",
    name: "Sắp xếp trộn (Merge Sort)",
    slug: "merge-sort",
    description:
      "Chia đôi mảng, sắp xếp đệ quy từng nửa rồi trộn hai nửa đã sắp xếp bằng cách liên tục lấy " +
      "phần tử nhỏ hơn ở đầu hai nửa; luôn O(n log n) nhưng cần thêm O(n) bộ nhớ phụ.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
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

export const seedComplexities: readonly (Omit<
  NewAlgorithmComplexity,
  "algorithmId"
> & {
  readonly algorithmKey: string;
})[] = complexitiesData;
