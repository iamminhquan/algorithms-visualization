import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "../authoring";
import type { IQuizQuestion } from "../types";

export const BUBBLE_SORT_QUIZ: readonly IQuizQuestion[] = [
  singleChoice({
    id: "bubble-sort.concept.1",
    topic: "concept",
    level: "recognize",
    prompt: "Ý tưởng chính của Bubble Sort là gì?",
    options: [
      "Lặp lại việc so sánh và đổi chỗ hai phần tử kề nhau nếu chúng sai thứ tự",
      "Chia mảng thành hai nửa bằng nhau rồi sắp xếp từng nửa",
      "Chọn phần tử nhỏ nhất còn lại đưa về đầu đoạn chưa sắp xếp",
    ],
    answer: 0,
    explanation:
      "Bubble Sort duyệt nhiều lượt; mỗi lượt so sánh các cặp kề nhau và đổi chỗ khi phần tử bên trái lớn hơn phần tử bên phải.",
  }),
  trueFalse({
    id: "bubble-sort.concept.2",
    topic: "concept",
    level: "recognize",
    prompt:
      "Bubble Sort có thể dừng sớm nếu trong một lượt duyệt không có lần hoán đổi nào.",
    answer: true,
    explanation:
      "Nếu cả lượt không có hoán đổi, mảng đã có thứ tự; cài đặt có cờ swapped sẽ kết thúc ngay.",
  }),
  singleChoice({
    id: "bubble-sort.mechanism.1",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Sau khi kết thúc lượt duyệt đầu tiên của Bubble Sort tăng dần, phần tử nào chắc chắn nằm ở cuối mảng?",
    options: ["Phần tử lớn nhất", "Phần tử nhỏ nhất", "Phần tử ở giữa mảng"],
    answer: 0,
    explanation:
      "Mỗi lượt đẩy phần tử lớn nhất của đoạn đang xét về cuối đoạn, nên sau lượt đầu phần tử lớn nhất nằm ở cuối mảng.",
  }),
  multipleChoice({
    id: "bubble-sort.mechanism.2",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong một lượt duyệt Bubble Sort tăng dần, những phát biểu nào đúng?",
    options: [
      "So sánh từng cặp phần tử kề nhau",
      "Đổi chỗ khi phần tử bên trái lớn hơn phần tử bên phải",
      "Chỉ so sánh phần tử đầu tiên với phần tử cuối cùng",
      "Sau lượt duyệt, phần tử lớn nhất của đoạn đang xét được đẩy về cuối đoạn",
    ],
    answers: [0, 1, 3],
    explanation:
      "Mỗi lượt quét các cặp kề nhau từ trái sang phải, nên phần tử lớn nhất nổi dần về cuối đoạn.",
  }),
  fillBlank({
    id: "bubble-sort.mechanism.3",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong Bubble Sort tăng dần, nếu a[j] > a[j+1] thì hai phần tử được làm gì?",
    accepted: [
      "đổi chỗ",
      "hoán đổi",
      "swap",
      "đổi chỗ cho nhau",
      "hoán đổi cho nhau",
    ],
    placeholder: "Ví dụ: đổi chỗ",
    explanation:
      "Khi phần tử bên trái lớn hơn phần tử bên phải, Bubble Sort hoán đổi hai phần tử kề nhau để đưa phần tử nhỏ về bên trái.",
  }),
  singleChoice({
    id: "bubble-sort.complexity.1",
    topic: "complexity",
    level: "understand",
    prompt: "Độ phức tạp thời gian trường hợp xấu nhất của Bubble Sort là gì?",
    options: ["O(n²)", "O(n log n)", "O(n)"],
    answer: 0,
    explanation:
      "Trường hợp xấu nhất cần khoảng n(n-1)/2 phép so sánh và hoán đổi, tức O(n²).",
  }),
  fillBlank({
    id: "bubble-sort.complexity.2",
    topic: "complexity",
    level: "understand",
    prompt:
      "Với cài đặt có cờ dừng sớm, độ phức tạp thời gian tốt nhất của Bubble Sort là gì? (nhập dạng O(...))",
    accepted: ["O(n)", "n", "tuyến tính"],
    placeholder: "Ví dụ: O(n)",
    explanation:
      "Khi mảng đã sắp xếp, lượt đầu không có hoán đổi nào và thuật toán dừng sau n-1 phép so sánh, tức O(n).",
  }),
  multipleChoice({
    id: "bubble-sort.property.1",
    topic: "property",
    level: "apply",
    prompt: "Những tính chất nào đúng với Bubble Sort?",
    options: [
      "Sắp xếp tại chỗ với O(1) bộ nhớ phụ",
      "Là thuật toán ổn định",
      "Luôn chạy trong O(n log n)",
      "Có thể dừng sớm nếu một lượt không có hoán đổi",
    ],
    answers: [0, 1, 3],
    explanation:
      "Bubble Sort đổi chỗ tại chỗ, giữ thứ tự các phần tử bằng nhau và có thể dừng sớm; độ phức tạp xấu nhất vẫn là O(n²).",
  }),
  trueFalse({
    id: "bubble-sort.property.2",
    topic: "property",
    level: "apply",
    prompt:
      "Bubble Sort (cài đặt chỉ đổi chỗ khi phần tử bên trái lớn hơn) là thuật toán ổn định.",
    answer: true,
    explanation:
      "Các phần tử bằng nhau không bị đổi chỗ, nên thứ tự tương đối của chúng được giữ nguyên.",
  }),
  singleChoice({
    id: "bubble-sort.application.1",
    topic: "application",
    level: "apply",
    prompt: "Tình huống nào Bubble Sort phù hợp nhất?",
    options: [
      "Mảng nhỏ, gần như đã sắp xếp và cần một thuật toán đơn giản, ổn định",
      "Mảng rất lớn cần sắp xếp nhanh trong mọi trường hợp",
      "Cần tìm nhanh một phần tử trong mảng đã sắp xếp",
    ],
    answer: 0,
    explanation:
      "Bubble Sort đơn giản, ổn định và chạy O(n) trên mảng gần như đã sắp xếp nhờ dừng sớm; nhưng O(n²) nên không phù hợp dữ liệu lớn.",
  }),
  multipleChoice({
    id: "bubble-sort.application.2",
    topic: "application",
    level: "apply",
    prompt: "So với Selection Sort, Bubble Sort có những điểm nào đúng?",
    options: [
      "Có thể dừng sớm khi mảng đã sắp xếp nếu cài đặt cờ swapped",
      "Cũng là thuật toán sắp xếp tại chỗ",
      "Luôn thực hiện ít phép so sánh hơn Selection Sort",
      "Có thể phát hiện mảng đã có thứ tự mà không cần chạy hết n-1 lượt",
    ],
    answers: [0, 1, 3],
    explanation:
      "Bubble Sort có thể dừng sớm; Selection Sort luôn chạy đủ các lượt. Cả hai đều sắp xếp tại chỗ, còn số phép so sánh của Bubble Sort không luôn ít hơn.",
  }),
  trueFalse({
    id: "bubble-sort.application.3",
    topic: "application",
    level: "apply",
    prompt:
      "Bubble Sort phù hợp để sắp xếp một triệu phần tử trong thời gian ngắn.",
    answer: false,
    explanation:
      "Bubble Sort có độ phức tạp O(n²); với một triệu phần tử, số phép so sánh và hoán đổi quá lớn để chạy nhanh.",
  }),
];
