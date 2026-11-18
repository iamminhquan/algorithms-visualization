import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "../authoring";
import type { IQuizQuestion } from "../types";

export const INSERTION_SORT_QUIZ: readonly IQuizQuestion[] = [
  singleChoice({
    id: "insertion-sort.concept.1",
    topic: "concept",
    level: "recognize",
    prompt: "Insertion Sort xây dựng mảng đã sắp xếp như thế nào?",
    options: [
      "Lấy từng phần tử và chèn vào đúng vị trí trong đoạn đã sắp xếp bên trái",
      "Chọn phần tử nhỏ nhất còn lại đưa về đầu đoạn",
      "Chia mảng thành hai nửa rồi trộn lại",
    ],
    answer: 0,
    explanation:
      "Insertion Sort giữ một đoạn đã sắp xếp ở đầu mảng, rồi chèn từng phần tử tiếp theo vào đúng vị trí trong đoạn đó.",
  }),
  trueFalse({
    id: "insertion-sort.concept.2",
    topic: "concept",
    level: "recognize",
    prompt:
      "Insertion Sort có thể chèn thêm phần tử mới vào mảng đang có mà vẫn giữ được đoạn đã sắp xếp.",
    answer: true,
    explanation:
      "Insertion Sort là thuật toán trực tuyến: có thể nhận thêm phần tử và chèn vào đúng vị trí trong đoạn đã sắp xếp.",
  }),
  singleChoice({
    id: "insertion-sort.mechanism.1",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Khi chèn một phần tử vào đoạn đã sắp xếp, các phần tử lớn hơn nó được làm gì?",
    options: [
      "Dịch sang phải một vị trí",
      "Xoá khỏi mảng",
      "Đổi chỗ với phần tử cuối mảng",
    ],
    answer: 0,
    explanation:
      "Các phần tử lớn hơn được dịch sang phải để tạo chỗ trống cho phần tử đang chèn.",
  }),
  multipleChoice({
    id: "insertion-sort.mechanism.2",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong một bước của Insertion Sort tăng dần, những phát biểu nào đúng?",
    options: [
      "Đoạn bên trái vị trí đang xét đã được sắp xếp",
      "Phần tử đang chèn được so sánh lần lượt với các phần tử bên trái",
      "Mọi phần tử bên phải vị trí đang xét đều đã được sắp xếp",
      "Các phần tử lớn hơn phần tử đang chèn được dịch sang phải",
    ],
    answers: [0, 1, 3],
    explanation:
      "Insertion Sort mở rộng dần đoạn đã sắp xếp ở bên trái; các phần tử lớn hơn được dịch phải để chèn phần tử mới.",
  }),
  fillBlank({
    id: "insertion-sort.mechanism.3",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong Insertion Sort, để chèn phần tử đang xét vào đúng vị trí, các phần tử lớn hơn nó được ... sang phải.",
    accepted: ["dịch", "dời", "di chuyển", "shift"],
    placeholder: "Ví dụ: dịch",
    explanation:
      "Việc dịch các phần tử lớn hơn sang phải tạo ra vị trí trống để đặt phần tử đang chèn.",
  }),
  singleChoice({
    id: "insertion-sort.complexity.1",
    topic: "complexity",
    level: "understand",
    prompt: "Độ phức tạp thời gian tốt nhất của Insertion Sort là gì?",
    options: ["O(n)", "O(n log n)", "O(n²)"],
    answer: 0,
    explanation:
      "Khi mảng đã sắp xếp, mỗi phần tử chỉ cần một phép so sánh để xác nhận đã đúng vị trí, nên tốn O(n).",
  }),
  fillBlank({
    id: "insertion-sort.complexity.2",
    topic: "complexity",
    level: "understand",
    prompt:
      "Độ phức tạp thời gian trường hợp xấu nhất của Insertion Sort là gì? (nhập dạng O(...))",
    accepted: ["O(n²)", "O(n^2)", "O(n2)", "n²"],
    placeholder: "Ví dụ: O(n²)",
    explanation:
      "Trường hợp xấu nhất là mảng ngược thứ tự; mỗi phần tử phải dịch qua gần như toàn bộ đoạn đã sắp xếp, tốn O(n²).",
  }),
  multipleChoice({
    id: "insertion-sort.property.1",
    topic: "property",
    level: "apply",
    prompt: "Những tính chất nào đúng với Insertion Sort?",
    options: [
      "Là thuật toán ổn định",
      "Sắp xếp tại chỗ với O(1) bộ nhớ phụ",
      "Luôn chạy O(n²) kể cả khi mảng đã sắp xếp",
      "Chạy nhanh trên mảng gần như đã sắp xếp",
    ],
    answers: [0, 1, 3],
    explanation:
      "Insertion Sort ổn định, tại chỗ và rất hiệu quả trên mảng gần như đã sắp xếp; trường hợp tốt nhất là O(n).",
  }),
  trueFalse({
    id: "insertion-sort.property.2",
    topic: "property",
    level: "apply",
    prompt:
      "Insertion Sort (chỉ dịch khi phần tử bên trái lớn hơn) là thuật toán ổn định.",
    answer: true,
    explanation:
      "Các phần tử bằng nhau không bị dịch qua nhau, nên thứ tự tương đối của chúng được giữ nguyên.",
  }),
  singleChoice({
    id: "insertion-sort.application.1",
    topic: "application",
    level: "apply",
    prompt: "Insertion Sort thường được dùng trong tình huống nào?",
    options: [
      "Mảng nhỏ hoặc gần như đã sắp xếp, cần thuật toán đơn giản và ổn định",
      "Mảng rất lớn, dữ liệu ngẫu nhiên hoàn toàn",
      "Cần tìm kiếm nhị phân trên mảng chưa sắp xếp",
    ],
    answer: 0,
    explanation:
      "Insertion Sort có chi phí thấp trên mảng nhỏ hoặc gần như đã sắp xếp, và thường được dùng cho các đoạn nhỏ trong thuật toán lai.",
  }),
  multipleChoice({
    id: "insertion-sort.application.2",
    topic: "application",
    level: "apply",
    prompt:
      "Vì sao Insertion Sort thường xuất hiện trong các thuật toán sắp xếp lai?",
    options: [
      "Nó xử lý tốt các đoạn nhỏ",
      "Nó có thể dừng rất nhanh trên đoạn gần như đã sắp xếp",
      "Nó luôn nhanh hơn Quick Sort trên mọi kích thước dữ liệu",
      "Nó không cần bộ nhớ phụ đáng kể",
    ],
    answers: [0, 1, 3],
    explanation:
      "Các thuật toán lai dùng Insertion Sort cho đoạn nhỏ vì nó đơn giản, tại chỗ và nhanh khi dữ liệu gần như đã có thứ tự.",
  }),
  trueFalse({
    id: "insertion-sort.application.3",
    topic: "application",
    level: "apply",
    prompt:
      "Insertion Sort phù hợp hơn Merge Sort khi cần sắp xếp một mảng rất lớn với dữ liệu ngẫu nhiên.",
    answer: false,
    explanation:
      "Với mảng lớn và ngẫu nhiên, Insertion Sort tốn O(n²), trong khi Merge Sort đảm bảo O(n log n).",
  }),
];
