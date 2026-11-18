import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "../authoring";
import type { IQuizQuestion } from "../types";

export const LINEAR_SEARCH_QUIZ: readonly IQuizQuestion[] = [
  singleChoice({
    id: "linear-search.concept.1",
    topic: "concept",
    level: "recognize",
    prompt: "Linear Search tìm một phần tử bằng cách nào?",
    options: [
      "Duyệt lần lượt từng phần tử từ đầu đến khi tìm thấy hoặc hết mảng",
      "Chia đôi mảng và so sánh với phần tử giữa",
      "Sắp xếp mảng rồi tìm kiếm nhị phân",
    ],
    answer: 0,
    explanation:
      "Linear Search kiểm tra tuần tự từng phần tử, nên không yêu cầu mảng đã sắp xếp.",
  }),
  trueFalse({
    id: "linear-search.concept.2",
    topic: "concept",
    level: "recognize",
    prompt: "Linear Search yêu cầu mảng phải được sắp xếp trước khi tìm kiếm.",
    answer: false,
    explanation:
      "Linear Search hoạt động trên mảng bất kỳ vì nó kiểm tra lần lượt từng phần tử.",
  }),
  singleChoice({
    id: "linear-search.mechanism.1",
    topic: "mechanism",
    level: "understand",
    prompt: "Khi nào Linear Search kết thúc?",
    options: [
      "Khi tìm thấy phần tử cần tìm hoặc đã duyệt hết mảng",
      "Sau khi kiểm tra phần tử ở giữa mảng",
      "Sau khi sắp xếp xong mảng",
    ],
    answer: 0,
    explanation:
      "Vòng lặp dừng ngay khi gặp giá trị cần tìm; nếu không có, nó kết thúc sau khi duyệt hết mảng.",
  }),
  multipleChoice({
    id: "linear-search.mechanism.2",
    topic: "mechanism",
    level: "understand",
    prompt: "Trong Linear Search, những phát biểu nào đúng?",
    options: [
      "Kiểm tra từng phần tử theo thứ tự",
      "Có thể dừng ngay khi gặp phần tử cần tìm",
      "Luôn phải duyệt toàn bộ mảng kể cả khi tìm thấy ở đầu",
      "Không cần mảng đã sắp xếp",
    ],
    answers: [0, 1, 3],
    explanation:
      "Linear Search duyệt tuần tự, dừng khi tìm thấy và không phụ thuộc vào thứ tự dữ liệu.",
  }),
  fillBlank({
    id: "linear-search.mechanism.3",
    topic: "mechanism",
    level: "understand",
    prompt: "Linear Search kiểm tra các phần tử theo thứ tự từ ... mảng.",
    accepted: ["đầu", "đầu mảng", "phần tử đầu", "vị trí đầu"],
    placeholder: "Ví dụ: đầu",
    explanation:
      "Thuật toán bắt đầu từ phần tử đầu tiên và đi dần về cuối mảng.",
  }),
  singleChoice({
    id: "linear-search.complexity.1",
    topic: "complexity",
    level: "understand",
    prompt: "Độ phức tạp thời gian xấu nhất của Linear Search là gì?",
    options: ["O(n)", "O(log n)", "O(n²)"],
    answer: 0,
    explanation:
      "Trường hợp xấu nhất phải kiểm tra toàn bộ n phần tử, nên thời gian là O(n).",
  }),
  fillBlank({
    id: "linear-search.complexity.2",
    topic: "complexity",
    level: "understand",
    prompt:
      "Độ phức tạp thời gian tốt nhất của Linear Search là gì? (nhập dạng O(...))",
    accepted: ["O(1)", "1", "hằng số"],
    placeholder: "Ví dụ: O(1)",
    explanation:
      "Nếu phần tử cần tìm nằm ngay đầu mảng, chỉ cần một phép so sánh, tức O(1).",
  }),
  multipleChoice({
    id: "linear-search.property.1",
    topic: "property",
    level: "apply",
    prompt: "Những tính chất nào đúng với Linear Search?",
    options: [
      "Không cần dữ liệu đã sắp xếp",
      "Có thể dùng cho danh sách liên kết",
      "Luôn nhanh hơn Binary Search trên mảng lớn",
      "Không cần bước tiền xử lý dữ liệu",
    ],
    answers: [0, 1, 3],
    explanation:
      "Linear Search không cần sắp xếp hay tiền xử lý và duyệt được danh sách liên kết; nhưng trên mảng lớn đã sắp xếp, Binary Search nhanh hơn.",
  }),
  trueFalse({
    id: "linear-search.property.2",
    topic: "property",
    level: "apply",
    prompt:
      "Linear Search có thể tìm kiếm trên danh sách liên kết mà không cần truy cập ngẫu nhiên.",
    answer: true,
    explanation:
      "Linear Search chỉ cần đi tuần tự qua các nút, nên phù hợp với danh sách liên kết.",
  }),
  singleChoice({
    id: "linear-search.application.1",
    topic: "application",
    level: "apply",
    prompt: "Khi nào Linear Search là lựa chọn hợp lý?",
    options: [
      "Mảng nhỏ hoặc dữ liệu chưa sắp xếp và chỉ cần tìm một lần",
      "Mảng rất lớn đã sắp xếp và cần tìm nhiều lần",
      "Cần tìm kiếm nhị phân trên mảng đã sắp xếp",
    ],
    answer: 0,
    explanation:
      "Với mảng nhỏ hoặc tìm một lần, chi phí sắp xếp để dùng Binary Search có thể lớn hơn lợi ích; Linear Search đơn giản và phù hợp.",
  }),
  multipleChoice({
    id: "linear-search.application.2",
    topic: "application",
    level: "apply",
    prompt: "Linear Search phù hợp trong những tình huống nào?",
    options: [
      "Dữ liệu nhỏ",
      "Dữ liệu chưa được sắp xếp",
      "Cần tìm kiếm rất nhiều lần trên mảng lớn đã sắp xếp",
      "Cấu trúc dữ liệu chỉ hỗ trợ duyệt tuần tự",
    ],
    answers: [0, 1, 3],
    explanation:
      "Linear Search hợp với dữ liệu nhỏ, chưa sắp xếp hoặc chỉ duyệt tuần tự; với mảng lớn đã sắp xếp, Binary Search hiệu quả hơn.",
  }),
  trueFalse({
    id: "linear-search.application.3",
    topic: "application",
    level: "apply",
    prompt:
      "Với mảng một triệu phần tử đã sắp xếp và cần tìm kiếm hàng nghìn lần, Linear Search là lựa chọn tối ưu.",
    answer: false,
    explanation:
      "Binary Search chỉ tốn O(log n) mỗi lần tìm, nên vượt trội Linear Search O(n) khi mảng lớn và tìm kiếm nhiều lần.",
  }),
];
