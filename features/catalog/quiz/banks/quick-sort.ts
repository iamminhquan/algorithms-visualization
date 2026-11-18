import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "../authoring";
import type { IQuizQuestion } from "../types";

export const QUICK_SORT_QUIZ: readonly IQuizQuestion[] = [
  singleChoice({
    id: "quick-sort.concept.1",
    topic: "concept",
    level: "recognize",
    prompt: "Ý tưởng chính của Quick Sort là gì?",
    options: [
      "Chọn pivot, phân hoạch mảng thành phần nhỏ hơn và lớn hơn pivot, rồi sắp xếp đệ quy hai phần",
      "Chia mảng thành hai nửa bằng nhau rồi trộn",
      "Chèn từng phần tử vào đoạn đã sắp xếp",
    ],
    answer: 0,
    explanation:
      "Quick Sort chọn pivot, đưa các phần tử nhỏ hơn về một phía và lớn hơn về phía còn lại, sau đó sắp xếp đệ quy hai phần.",
  }),
  trueFalse({
    id: "quick-sort.concept.2",
    topic: "concept",
    level: "recognize",
    prompt:
      "Quick Sort luôn đảm bảo độ phức tạp O(n log n) trong mọi trường hợp.",
    answer: false,
    explanation:
      "Quick Sort có worst-case O(n²) khi các lần phân hoạch mất cân bằng, ví dụ chọn pivot đầu tiên trên mảng đã sắp xếp.",
  }),
  singleChoice({
    id: "quick-sort.mechanism.1",
    topic: "mechanism",
    level: "understand",
    prompt: "Sau bước phân hoạch của Quick Sort, pivot nằm ở đâu?",
    options: [
      "Ở đúng vị trí cuối cùng của nó trong mảng đã sắp xếp",
      "Luôn ở đầu mảng",
      "Luôn ở cuối mảng",
    ],
    answer: 0,
    explanation:
      "Sau phân hoạch, mọi phần tử bên trái pivot nhỏ hơn hoặc bằng pivot và mọi phần tử bên phải lớn hơn hoặc bằng pivot, nên pivot đã đúng vị trí.",
  }),
  multipleChoice({
    id: "quick-sort.mechanism.2",
    topic: "mechanism",
    level: "understand",
    prompt: "Trong bước phân hoạch của Quick Sort, những phát biểu nào đúng?",
    options: [
      "Các phần tử nhỏ hơn pivot được đưa về một phía",
      "Các phần tử lớn hơn pivot được đưa về phía còn lại",
      "Pivot luôn bị loại bỏ khỏi mảng",
      "Sau phân hoạch, pivot không cần tham gia vào các lần sắp xếp tiếp theo",
    ],
    answers: [0, 1, 3],
    explanation:
      "Phân hoạch chia mảng quanh pivot; pivot đã đúng vị trí nên chỉ cần sắp xếp đệ quy hai phần bên cạnh.",
  }),
  fillBlank({
    id: "quick-sort.mechanism.3",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong Quick Sort, phần tử được chọn làm mốc để phân hoạch mảng được gọi là ...",
    accepted: ["pivot", "chốt", "mốc"],
    placeholder: "Ví dụ: pivot",
    explanation:
      "Pivot là phần tử mốc; sau phân hoạch, các phần tử nhỏ hơn nằm bên trái và lớn hơn nằm bên phải pivot.",
  }),
  singleChoice({
    id: "quick-sort.complexity.1",
    topic: "complexity",
    level: "understand",
    prompt: "Độ phức tạp thời gian trung bình của Quick Sort là gì?",
    options: ["O(n log n)", "O(n²)", "O(n)"],
    answer: 0,
    explanation:
      "Khi các lần phân hoạch tương đối cân bằng, Quick Sort chia bài toán thành hai phần gần bằng nửa, cho O(n log n) trung bình.",
  }),
  fillBlank({
    id: "quick-sort.complexity.2",
    topic: "complexity",
    level: "understand",
    prompt:
      "Độ phức tạp thời gian xấu nhất của Quick Sort là gì? (nhập dạng O(...))",
    accepted: ["O(n²)", "O(n^2)", "O(n2)", "n²"],
    placeholder: "Ví dụ: O(n²)",
    explanation:
      "Nếu pivot luôn là phần tử nhỏ nhất hoặc lớn nhất, các lần phân hoạch lệch hẳn về một phía và tổng thời gian là O(n²).",
  }),
  multipleChoice({
    id: "quick-sort.property.1",
    topic: "property",
    level: "apply",
    prompt: "Những tính chất nào đúng với Quick Sort?",
    options: [
      "Thường sắp xếp tại chỗ, chỉ tốn bộ nhớ cho ngăn xếp đệ quy",
      "Là thuật toán ổn định trong cài đặt phân hoạch tiêu chuẩn",
      "Trung bình chạy O(n log n)",
      "Có thể chạy O(n²) nếu chọn pivot kém",
    ],
    answers: [0, 2, 3],
    explanation:
      "Quick Sort tại chỗ và trung bình O(n log n), nhưng có worst-case O(n²); cài đặt phân hoạch tiêu chuẩn không ổn định.",
  }),
  trueFalse({
    id: "quick-sort.property.2",
    topic: "property",
    level: "apply",
    prompt:
      "Quick Sort với cài đặt phân hoạch tiêu chuẩn là thuật toán ổn định.",
    answer: false,
    explanation:
      "Các phép đổi chỗ trong phân hoạch có thể làm thay đổi thứ tự tương đối của các phần tử bằng nhau.",
  }),
  singleChoice({
    id: "quick-sort.application.1",
    topic: "application",
    level: "apply",
    prompt:
      "Cách chọn pivot nào thường giúp Quick Sort tránh worst-case trên mảng đã sắp xếp?",
    options: [
      "Chọn pivot ngẫu nhiên hoặc median-of-three",
      "Luôn chọn phần tử đầu tiên",
      "Luôn chọn phần tử lớn nhất",
    ],
    answer: 0,
    explanation:
      "Pivot ngẫu nhiên hoặc median-of-three giảm khả năng gặp phân hoạch lệch, đặc biệt trên mảng đã sắp xếp.",
  }),
  multipleChoice({
    id: "quick-sort.application.2",
    topic: "application",
    level: "apply",
    prompt: "Quick Sort thường được ưa chuộng vì những lý do nào?",
    options: [
      "Trung bình nhanh và có bộ nhớ đệm tốt",
      "Sắp xếp tại chỗ, ít bộ nhớ phụ",
      "Đảm bảo O(n log n) trong mọi trường hợp",
      "Có nhiều biến thể tối ưu cho dữ liệu thực tế",
    ],
    answers: [0, 1, 3],
    explanation:
      "Quick Sort nhanh trong thực tế, tại chỗ và có nhiều biến thể; nhưng không đảm bảo O(n log n) ở worst-case.",
  }),
  trueFalse({
    id: "quick-sort.application.3",
    topic: "application",
    level: "apply",
    prompt:
      "Quick Sort là lựa chọn phù hợp khi cần sắp xếp ổn định và không được phép có worst-case O(n²).",
    answer: false,
    explanation:
      "Quick Sort tiêu chuẩn không ổn định và có worst-case O(n²); nếu cần cả hai, Merge Sort là lựa chọn phù hợp hơn. Heap Sort chỉ giúp tránh worst-case O(n²) nhưng không ổn định.",
  }),
];
