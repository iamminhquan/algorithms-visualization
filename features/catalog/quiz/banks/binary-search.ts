import {
  fillBlank,
  multipleChoice,
  singleChoice,
  trueFalse,
} from "../authoring";
import type { IQuizQuestion } from "../types";

export const BINARY_SEARCH_QUIZ: readonly IQuizQuestion[] = [
  singleChoice({
    id: "binary-search.concept.1",
    topic: "concept",
    level: "recognize",
    prompt: "Điều kiện bắt buộc để Binary Search hoạt động đúng là gì?",
    options: [
      "Mảng đã được sắp xếp theo thứ tự",
      "Mảng có số phần tử chẵn",
      "Mảng không chứa số âm",
    ],
    answer: 0,
    explanation:
      "Binary Search dựa vào thứ tự để loại bỏ một nửa vùng tìm kiếm, nên dữ liệu phải được sắp xếp.",
  }),
  trueFalse({
    id: "binary-search.concept.2",
    topic: "concept",
    level: "recognize",
    prompt:
      "Binary Search có thể áp dụng cho mảng chưa sắp xếp nếu mảng không có phần tử trùng.",
    answer: false,
    explanation:
      "Không có thứ tự thì không thể biết nên loại bỏ nửa nào; Binary Search cần dữ liệu đã sắp xếp hoặc một tính chất đơn điệu tương đương.",
  }),
  singleChoice({
    id: "binary-search.mechanism.1",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong Binary Search, nếu a[mid] < target thì vùng tìm kiếm tiếp theo nằm ở đâu?",
    options: [
      "Nửa bên phải của mid",
      "Nửa bên trái của mid",
      "Toàn bộ mảng ban đầu",
    ],
    answer: 0,
    explanation:
      "Vì mảng đã sắp xếp, nếu a[mid] < target thì target chỉ có thể nằm bên phải mid.",
  }),
  multipleChoice({
    id: "binary-search.mechanism.2",
    topic: "mechanism",
    level: "understand",
    prompt: "Trong mỗi bước của Binary Search, những phát biểu nào đúng?",
    options: [
      "So sánh target với phần tử ở giữa vùng tìm kiếm",
      "Loại bỏ một nửa vùng tìm kiếm sau mỗi lần so sánh",
      "Duyệt lần lượt từng phần tử trong vùng tìm kiếm",
      "Cập nhật low hoặc high tùy theo kết quả so sánh",
    ],
    answers: [0, 1, 3],
    explanation:
      "Binary Search so sánh với phần tử giữa rồi thu hẹp vùng tìm kiếm bằng cách cập nhật low hoặc high.",
  }),
  fillBlank({
    id: "binary-search.mechanism.3",
    topic: "mechanism",
    level: "understand",
    prompt:
      "Trong Binary Search, nếu a[mid] > target thì vùng tìm kiếm tiếp theo nằm ở nửa ... của mid.",
    accepted: ["trái", "bên trái", "phía trái"],
    placeholder: "Ví dụ: trái",
    explanation:
      "Vì mảng đã sắp xếp, nếu a[mid] lớn hơn target thì target chỉ có thể nằm bên trái mid.",
  }),
  singleChoice({
    id: "binary-search.complexity.1",
    topic: "complexity",
    level: "understand",
    prompt: "Độ phức tạp thời gian xấu nhất của Binary Search là gì?",
    options: ["O(log n)", "O(n)", "O(n log n)"],
    answer: 0,
    explanation:
      "Mỗi bước loại bỏ một nửa vùng tìm kiếm, nên sau khoảng log₂ n bước là kết thúc.",
  }),
  fillBlank({
    id: "binary-search.complexity.2",
    topic: "complexity",
    level: "understand",
    prompt:
      "Binary Search cần thêm bao nhiêu bộ nhớ phụ trong cài đặt lặp? (nhập dạng O(...))",
    accepted: ["O(1)", "1", "hằng số"],
    placeholder: "Ví dụ: O(1)",
    explanation:
      "Cài đặt lặp chỉ dùng vài biến low, high, mid, nên bộ nhớ phụ là O(1).",
  }),
  multipleChoice({
    id: "binary-search.property.1",
    topic: "property",
    level: "apply",
    prompt: "Những tính chất nào đúng với Binary Search?",
    options: [
      "Yêu cầu dữ liệu đã sắp xếp",
      "Nhanh hơn Linear Search trên mảng lớn đã sắp xếp",
      "Có thể dùng hiệu quả trên danh sách liên kết mà không cần truy cập ngẫu nhiên",
      "Cài đặt lặp chỉ tốn O(1) bộ nhớ phụ",
    ],
    answers: [0, 1, 3],
    explanation:
      "Binary Search cần dữ liệu có thứ tự và truy cập ngẫu nhiên; trên mảng lớn đã sắp xếp nó nhanh hơn Linear Search.",
  }),
  trueFalse({
    id: "binary-search.property.2",
    topic: "property",
    level: "apply",
    prompt:
      "Binary Search trên mảng đã sắp xếp luôn trả về vị trí đầu tiên của một giá trị nếu có nhiều phần tử trùng.",
    answer: false,
    explanation:
      "Cài đặt tiêu chuẩn có thể trả về bất kỳ vị trí nào trong các phần tử trùng; muốn lấy vị trí đầu tiên hoặc cuối cùng cần biến thể lower-bound/upper-bound.",
  }),
  singleChoice({
    id: "binary-search.application.1",
    topic: "application",
    level: "apply",
    prompt: "Khi nào Binary Search là lựa chọn tốt?",
    options: [
      "Mảng lớn đã sắp xếp và cần tìm kiếm nhiều lần",
      "Mảng nhỏ chưa sắp xếp và chỉ tìm một lần",
      "Dữ liệu thay đổi liên tục và không cần giữ thứ tự",
    ],
    answer: 0,
    explanation:
      "Binary Search rất hiệu quả khi dữ liệu đã sắp xếp và được tìm kiếm nhiều lần; chi phí sắp xếp ban đầu được chia nhỏ qua nhiều lần tìm.",
  }),
  multipleChoice({
    id: "binary-search.application.2",
    topic: "application",
    level: "apply",
    prompt: "Binary Search phù hợp trong những tình huống nào?",
    options: [
      "Tìm kiếm trên mảng lớn đã sắp xếp",
      "Tìm kiếm nhiều lần trên cùng một tập dữ liệu",
      "Dữ liệu được chèn/xoá liên tục mà không muốn sắp xếp lại",
      "Tìm kiếm trên mảng tĩnh, ít thay đổi",
    ],
    answers: [0, 1, 3],
    explanation:
      "Binary Search cần dữ liệu có thứ tự và truy cập ngẫu nhiên; nếu dữ liệu thay đổi liên tục, chi phí sắp xếp lại làm giảm lợi ích.",
  }),
  trueFalse({
    id: "binary-search.application.3",
    topic: "application",
    level: "apply",
    prompt:
      "Nếu mảng chưa sắp xếp nhưng chỉ tìm kiếm một lần, sắp xếp rồi dùng Binary Search luôn nhanh hơn Linear Search.",
    answer: false,
    explanation:
      "Sắp xếp tốn O(n log n), trong khi Linear Search chỉ tốn O(n); với một lần tìm, Linear Search thường nhanh hơn.",
  }),
];
