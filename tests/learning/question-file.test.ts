import { describe, expect, test } from "bun:test";
import { parseQuestionRows } from "@/features/learning/question-file";

describe("parseQuestionRows", () => {
  test("đọc câu trắc nghiệm với đáp án đúng theo số thứ tự", () => {
    const result = parseQuestionRows([
      {
        Loại: "Trắc nghiệm",
        "Nội dung": "Phần tử lớn nhất nằm ở đâu?",
        "Lựa chọn": "Đầu dãy|Cuối dãy|Giữa dãy",
        "Đáp án đúng": "2",
        Điểm: "2",
      },
    ]);

    expect(result.errors).toEqual([]);
    expect(result.questions).toHaveLength(1);
    const [question] = result.questions;
    expect(question.type).toBe("multiple_choice");
    expect(question.points).toBe(2);
    expect(question.options.map((option) => option.isCorrect)).toEqual([
      false,
      true,
      false,
    ]);
  });

  test("đọc câu điền khuyết nhiều chỗ trống và nhiều đáp án", () => {
    const result = parseQuestionRows([
      {
        Loại: "Điền khuyết",
        "Nội dung": "Bubble Sort có độ phức tạp {{1}} và cần {{2}} bộ nhớ phụ.",
        "Đáp án chấp nhận": "1=O(n^2)|1=O(n²)|2=O(1)",
        "Cách so khớp": "Không phân biệt hoa thường",
      },
    ]);

    expect(result.errors).toEqual([]);
    const [question] = result.questions;
    expect(question.type).toBe("fill_blank");
    expect(question.matchMode).toBe("case_insensitive");
    expect(question.answerKeys).toEqual([
      { blankIndex: 1, acceptedValue: "O(n^2)" },
      { blankIndex: 1, acceptedValue: "O(n²)" },
      { blankIndex: 2, acceptedValue: "O(1)" },
    ]);
  });

  test("tự suy luận loại câu hỏi khi bỏ trống cột Loại", () => {
    const result = parseQuestionRows([
      {
        "Nội dung": "Độ phức tạp của Binary Search?",
        "Đáp án chấp nhận": "O(log n)",
      },
      { "Nội dung": "Có mấy bước?", "Lựa chọn": "1|2", "Đáp án đúng": "1" },
    ]);

    expect(result.errors).toEqual([]);
    expect(result.questions.map((question) => question.type)).toEqual([
      "final_answer",
      "multiple_choice",
    ]);
  });

  test("cho phép nhiều đáp án đúng khi bật cột Nhiều đáp án", () => {
    const result = parseQuestionRows([
      {
        "Nội dung": "Thuật toán nào có độ phức tạp O(n log n)?",
        "Lựa chọn": "Merge Sort|Bubble Sort|Heap Sort",
        "Đáp án đúng": "1|3",
        "Nhiều đáp án": "x",
      },
    ]);

    expect(result.errors).toEqual([]);
    const [question] = result.questions;
    expect(question.allowMultiple).toBe(true);
    expect(question.options.filter((option) => option.isCorrect)).toHaveLength(
      2,
    );
  });

  test("báo lỗi theo số dòng khi thiếu nội dung hoặc đáp án", () => {
    const result = parseQuestionRows([
      { "Nội dung": "", "Đáp án chấp nhận": "O(n)" },
      { "Nội dung": "Câu hỏi", "Lựa chọn": "A|B", "Đáp án đúng": "" },
      { "Nội dung": "Câu hỏi khác", "Đáp án chấp nhận": "O(n)", Điểm: "0" },
    ]);

    expect(result.questions).toEqual([]);
    expect(result.errors.map((error) => error.code)).toEqual([
      "MISSING_CONTENT",
      "MISSING_CORRECT",
      "INVALID_POINTS",
    ]);
    expect(result.errors.map((error) => error.row)).toEqual([2, 3, 4]);
  });

  test("báo lỗi khi đáp án đúng không khớp lựa chọn nào", () => {
    const result = parseQuestionRows([
      {
        "Nội dung": "Câu hỏi",
        "Lựa chọn": "A|B",
        "Đáp án đúng": "C",
      },
    ]);

    expect(result.questions).toEqual([]);
    expect(result.errors[0].code).toBe("UNKNOWN_CORRECT");
  });
});
