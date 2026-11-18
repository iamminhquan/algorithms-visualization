import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "../authoring";
import type { IQuizQuestion } from "../types";

export const SELECTION_SORT_QUIZ: readonly IQuizQuestion[] = [
  singleChoice({
    id: "selection-sort.concept.1",
    topic: "concept",
    level: "recognize",
    prompt: "Selection Sort làm gì ở đầu mỗi lượt?",
    options: [
      "Tìm phần tử nhỏ nhất trong đoạn chưa sắp xếp rồi đổi nó với phần tử đầu đoạn",
      "Đổi chỗ mọi cặp phần tử kề nhau nếu sai thứ tự",
      "Chia mảng thành hai nửa rồi sắp xếp từng nửa",
    ],
    answer: 0,
    explanation:
      "Mỗi lượt chọn phần tử nhỏ nhất còn lại và đặt nó vào đúng vị trí đầu đoạn chưa sắp xếp.",
  }),
  trueFalse({
    id: "selection-sort.concept.2",
    topic: "concept",
    level: "recognize",
    prompt:
      "Selection Sort luôn thực hiện đúng n-1 lượt chọn, kể cả khi mảng đã được sắp xếp.",
    answer: true,
    explanation:
      "Selection Sort không có cơ chế dừng sớm; mỗi lượt vẫn phải quét đoạn còn lại để tìm phần tử nhỏ nhất.",
  }),
  singleChoice({
    id: "selection-sort.mechanism.1",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Sau khi kết thúc lượt đầu tiên của Selection Sort tăng dần, phần tử nào nằm ở vị trí đầu mảng?",
    options: [
      "Phần tử nhỏ nhất của mảng",
      "Phần tử lớn nhất của mảng",
      "Phần tử ở giữa mảng",
    ],
    answer: 0,
    explanation:
      "Lượt đầu chọn phần tử nhỏ nhất của cả mảng và đổi nó về vị trí đầu tiên.",
  }),
  multipleChoice({
    id: "selection-sort.mechanism.2",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong một lượt của Selection Sort tăng dần, những phát biểu nào đúng?",
    options: [
      "Duyệt đoạn chưa sắp xếp để tìm phần tử nhỏ nhất",
      "Đổi chỗ phần tử nhỏ nhất với phần tử đầu đoạn chưa sắp xếp",
      "So sánh từng cặp phần tử kề nhau và đổi chỗ ngay khi sai thứ tự",
      "Sau lượt, đoạn chưa sắp xếp bắt đầu từ vị trí tiếp theo",
    ],
    answers: [0, 1, 3],
    explanation:
      "Selection Sort tìm cực trị rồi mới đổi chỗ một lần, sau đó thu hẹp đoạn chưa sắp xếp.",
  }),
  fillBlank({
    id: "selection-sort.mechanism.3",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Selection Sort tìm phần tử nhỏ nhất trong đoạn chưa sắp xếp rồi đổi chỗ nó với phần tử ở ... của đoạn.",
    accepted: ["đầu", "đầu đoạn", "vị trí đầu", "phần tử đầu"],
    placeholder: "Ví dụ: đầu",
    explanation:
      "Phần tử nhỏ nhất được đưa về đầu đoạn chưa sắp xếp, sau đó đoạn này bắt đầu từ vị trí kế tiếp.",
  }),
  singleChoice({
    id: "selection-sort.complexity.1",
    topic: "complexity",
    level: "understand",
    prompt:
      "Độ phức tạp thời gian của Selection Sort trong trường hợp tốt nhất là gì?",
    options: ["O(n²)", "O(n log n)", "O(n)"],
    answer: 0,
    explanation:
      "Dù mảng đã sắp xếp, Selection Sort vẫn phải quét toàn bộ đoạn còn lại để tìm phần tử nhỏ nhất, nên tốn O(n²) phép so sánh.",
  }),
  fillBlank({
    id: "selection-sort.complexity.2",
    topic: "complexity",
    level: "understand",
    prompt: "Selection Sort cần thêm bao nhiêu bộ nhớ phụ? (nhập dạng O(...))",
    accepted: ["O(1)", "1", "hằng số"],
    placeholder: "Ví dụ: O(1)",
    explanation:
      "Selection Sort chỉ dùng vài biến tạm để lưu chỉ số và hoán đổi, nên bộ nhớ phụ là O(1).",
  }),
  multipleChoice({
    id: "selection-sort.property.1",
    topic: "property",
    level: "apply",
    prompt: "Những tính chất nào đúng với Selection Sort?",
    options: [
      "Sắp xếp tại chỗ với O(1) bộ nhớ phụ",
      "Số lần hoán đổi nhiều nhất là n-1",
      "Là thuật toán ổn định trong cài đặt đổi chỗ tiêu chuẩn",
      "Luôn chạy O(n²) phép so sánh, không phụ thuộc dữ liệu đầu vào",
    ],
    answers: [0, 1, 3],
    explanation:
      "Selection Sort tại chỗ, tối đa n-1 lần hoán đổi và luôn tốn O(n²) phép so sánh. Cài đặt đổi chỗ tiêu chuẩn không ổn định.",
  }),
  trueFalse({
    id: "selection-sort.property.2",
    topic: "property",
    level: "apply",
    prompt:
      "Selection Sort với cài đặt đổi chỗ tiêu chuẩn là thuật toán ổn định.",
    answer: false,
    explanation:
      "Việc đổi chỗ phần tử nhỏ nhất với phần tử đầu đoạn có thể nhảy qua các phần tử bằng nhau và làm đổi thứ tự tương đối của chúng.",
  }),
  singleChoice({
    id: "selection-sort.application.1",
    topic: "application",
    level: "apply",
    prompt: "Tình huống nào Selection Sort có ưu thế hơn?",
    options: [
      "Dữ liệu nhỏ và chi phí ghi/hoán đổi đắt, cần hạn chế số lần hoán đổi",
      "Mảng rất lớn cần sắp xếp nhanh",
      "Cần sắp xếp ổn định một danh sách lớn",
    ],
    answer: 0,
    explanation:
      "Selection Sort chỉ hoán đổi tối đa n-1 lần, phù hợp khi thao tác ghi đắt; nhưng vẫn tốn O(n²) phép so sánh và không ổn định.",
  }),
  multipleChoice({
    id: "selection-sort.application.2",
    topic: "application",
    level: "apply",
    prompt: "So với Bubble Sort, Selection Sort có những điểm nào đúng?",
    options: [
      "Thường thực hiện ít lần hoán đổi hơn",
      "Không có cơ chế dừng sớm khi mảng đã sắp xếp",
      "Luôn ổn định hơn Bubble Sort",
      "Vẫn có độ phức tạp thời gian xấu nhất O(n²)",
    ],
    answers: [0, 1, 3],
    explanation:
      "Selection Sort tối đa n-1 lần hoán đổi và không dừng sớm; cả hai đều có worst-case O(n²). Cài đặt tiêu chuẩn của Selection Sort không ổn định.",
  }),
  trueFalse({
    id: "selection-sort.application.3",
    topic: "application",
    level: "apply",
    prompt:
      "Selection Sort là lựa chọn tốt để sắp xếp lặp lại nhiều lần một mảng lớn đã có thứ tự.",
    answer: false,
    explanation:
      "Selection Sort vẫn chạy O(n²) dù mảng đã có thứ tự, nên không phù hợp với mảng lớn hoặc cần sắp xếp lại nhiều lần.",
  }),
];
