import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "../authoring";
import type { IQuizQuestion } from "../types";

export const MERGE_SORT_QUIZ: readonly IQuizQuestion[] = [
  singleChoice({
    id: "merge-sort.concept.1",
    topic: "concept",
    level: "recognize",
    prompt: "Ý tưởng chính của Merge Sort là gì?",
    options: [
      "Chia mảng thành hai nửa, sắp xếp từng nửa rồi trộn hai nửa đã sắp xếp",
      "Chọn pivot rồi phân hoạch mảng thành hai phần",
      "Chèn từng phần tử vào đoạn đã sắp xếp bên trái",
    ],
    answer: 0,
    explanation:
      "Merge Sort là thuật toán chia để trị: chia đôi mảng, sắp xếp đệ quy từng nửa, rồi trộn hai nửa đã có thứ tự.",
  }),
  trueFalse({
    id: "merge-sort.concept.2",
    topic: "concept",
    level: "recognize",
    prompt: "Merge Sort có thể sắp xếp mảng mà không cần so sánh các phần tử.",
    answer: false,
    explanation:
      "Merge Sort là thuật toán sắp xếp dựa trên so sánh; bước trộn so sánh phần tử đầu của hai nửa để chọn phần tử nhỏ hơn.",
  }),
  singleChoice({
    id: "merge-sort.mechanism.1",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong bước trộn của Merge Sort, ta chọn phần tử nào để đưa vào mảng kết quả?",
    options: [
      "Phần tử nhỏ hơn trong hai phần tử đầu của hai nửa",
      "Phần tử lớn hơn trong hai phần tử cuối của hai nửa",
      "Phần tử ở giữa mảng ban đầu",
    ],
    answer: 0,
    explanation:
      "Bước trộn so sánh hai phần tử đầu hiện tại của hai nửa và lấy phần tử nhỏ hơn.",
  }),
  multipleChoice({
    id: "merge-sort.mechanism.2",
    topic: "mechanism",
    level: "understand",
    prompt: "Trong quá trình Merge Sort, những phát biểu nào đúng?",
    options: [
      "Mảng được chia đệ quy thành các đoạn nhỏ hơn",
      "Hai nửa đã sắp xếp được trộn thành một đoạn lớn hơn",
      "Mỗi bước chỉ đổi chỗ hai phần tử kề nhau",
      "Khi trộn, nếu hai phần tử bằng nhau thì lấy phần tử của nửa bên trái để giữ tính ổn định",
    ],
    answers: [0, 1, 3],
    explanation:
      "Merge Sort chia nhỏ, sắp xếp từng phần rồi trộn lại; khi bằng nhau, lấy phần tử bên trái giúp giữ thứ tự ban đầu.",
  }),
  fillBlank({
    id: "merge-sort.mechanism.3",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Bước kết hợp hai nửa đã sắp xếp trong Merge Sort được gọi là bước ...",
    accepted: ["trộn", "merge", "hợp nhất"],
    placeholder: "Ví dụ: trộn",
    explanation:
      "Bước trộn (merge) so sánh các phần tử đầu của hai nửa và ghép chúng thành một đoạn đã sắp xếp.",
  }),
  singleChoice({
    id: "merge-sort.complexity.1",
    topic: "complexity",
    level: "understand",
    prompt:
      "Độ phức tạp thời gian của Merge Sort trong trường hợp xấu nhất là gì?",
    options: ["O(n log n)", "O(n²)", "O(n)"],
    answer: 0,
    explanation:
      "Mỗi tầng chia và trộn tốn O(n), có O(log n) tầng, nên tổng thời gian là O(n log n) trong mọi trường hợp.",
  }),
  fillBlank({
    id: "merge-sort.complexity.2",
    topic: "complexity",
    level: "understand",
    prompt:
      "Merge Sort cần thêm bao nhiêu bộ nhớ phụ trong cài đặt với mảng? (nhập dạng O(...))",
    accepted: ["O(n)", "n", "tuyến tính"],
    placeholder: "Ví dụ: O(n)",
    explanation:
      "Cài đặt Merge Sort trên mảng cần mảng tạm để trộn hai nửa, nên bộ nhớ phụ là O(n).",
  }),
  multipleChoice({
    id: "merge-sort.property.1",
    topic: "property",
    level: "apply",
    prompt: "Những tính chất nào đúng với Merge Sort?",
    options: [
      "Là thuật toán ổn định nếu khi trộn lấy phần tử bên trái khi bằng nhau",
      "Có độ phức tạp thời gian O(n log n) trong mọi trường hợp",
      "Sắp xếp tại chỗ với O(1) bộ nhớ phụ",
      "Thường cần thêm O(n) bộ nhớ phụ khi làm việc với mảng",
    ],
    answers: [0, 1, 3],
    explanation:
      "Merge Sort ổn định, đảm bảo O(n log n) nhưng cần O(n) bộ nhớ phụ cho mảng tạm.",
  }),
  trueFalse({
    id: "merge-sort.property.2",
    topic: "property",
    level: "apply",
    prompt: "Merge Sort trên mảng là thuật toán sắp xếp tại chỗ.",
    answer: false,
    explanation:
      "Cài đặt tiêu chuẩn cần mảng tạm để trộn, nên không phải tại chỗ; bộ nhớ phụ là O(n).",
  }),
  singleChoice({
    id: "merge-sort.application.1",
    topic: "application",
    level: "apply",
    prompt: "Merge Sort phù hợp nhất với tình huống nào?",
    options: [
      "Cần thời gian O(n log n) ổn định và chấp nhận dùng thêm bộ nhớ",
      "Cần sắp xếp tại chỗ với bộ nhớ phụ O(1)",
      "Dữ liệu đã sắp xếp và chỉ cần chèn thêm vài phần tử",
    ],
    answer: 0,
    explanation:
      "Merge Sort đảm bảo O(n log n) và ổn định, đổi lại cần O(n) bộ nhớ phụ; rất phù hợp khi bộ nhớ không phải ràng buộc chính.",
  }),
  multipleChoice({
    id: "merge-sort.application.2",
    topic: "application",
    level: "apply",
    prompt: "Merge Sort có ưu điểm nào so với Quick Sort?",
    options: [
      "Đảm bảo O(n log n) ngay cả trong trường hợp xấu nhất",
      "Là thuật toán ổn định khi cài đặt đúng",
      "Luôn dùng ít bộ nhớ phụ hơn Quick Sort",
      "Phù hợp với sắp xếp ngoài bộ nhớ hoặc danh sách liên kết",
    ],
    answers: [0, 1, 3],
    explanation:
      "Merge Sort đảm bảo O(n log n) và ổn định, nhưng thường tốn bộ nhớ phụ hơn Quick Sort.",
  }),
  trueFalse({
    id: "merge-sort.application.3",
    topic: "application",
    level: "apply",
    prompt:
      "Merge Sort thường là lựa chọn tốt khi cần sắp xếp dữ liệu lớn không vừa bộ nhớ.",
    answer: true,
    explanation:
      "Merge Sort có thể chia dữ liệu thành các khối, sắp xếp từng khối rồi trộn, nên phù hợp với sắp xếp ngoài bộ nhớ.",
  }),
];
