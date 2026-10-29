import { describe, expect, test } from "bun:test";
import {
  MAX_ANSWER_LENGTH,
  MAX_HISTORY_MESSAGES,
  MAX_QUESTION_LENGTH,
} from "@/engine/assistant";
import { parseAssistantRequest } from "@/features/assistant/validate";

function expectInvalid(body: unknown): string {
  const result = parseAssistantRequest(body);
  if (result.type !== "invalid") {
    throw new Error(`Mong đợi invalid nhưng nhận ${JSON.stringify(result)}`);
  }
  return result.message;
}

const QUESTION = { role: "user", content: "Bubble Sort là gì?" } as const;

describe("parseAssistantRequest", () => {
  test("chấp nhận yêu cầu hợp lệ và cắt khoảng trắng hai đầu", () => {
    expect(
      parseAssistantRequest({
        provider: "gemini",
        messages: [
          { role: "user", content: "  Xin chào  " },
          { role: "assistant", content: "Chào bạn" },
          { role: "user", content: "Giải thích bước này\n" },
        ],
      }),
    ).toEqual({
      type: "valid",
      request: {
        provider: "gemini",
        messages: [
          { role: "user", content: "Xin chào" },
          { role: "assistant", content: "Chào bạn" },
          { role: "user", content: "Giải thích bước này" },
        ],
      },
    });
  });

  test("bỏ qua trường thừa trong tin nhắn", () => {
    const result = parseAssistantRequest({
      provider: "deepseek",
      messages: [{ ...QUESTION, id: 1, extra: true }],
    });
    expect(result).toEqual({
      type: "valid",
      request: { provider: "deepseek", messages: [QUESTION] },
    });
  });

  test("từ chối body không phải object", () => {
    for (const body of [null, "x", 1, [], undefined]) {
      expect(expectInvalid(body)).toContain("định dạng");
    }
  });

  test("từ chối mô hình không được hỗ trợ", () => {
    expect(expectInvalid({ provider: "claude", messages: [QUESTION] })).toBe(
      "Không nhận ra mô hình AI được chọn.",
    );
  });

  test("từ chối khi thiếu hoặc rỗng danh sách tin nhắn", () => {
    expect(expectInvalid({ provider: "gemini" })).toContain("ít nhất một");
    expect(expectInvalid({ provider: "gemini", messages: [] })).toContain(
      "ít nhất một",
    );
  });

  test("từ chối lịch sử dài hơn giới hạn", () => {
    const messages = Array.from(
      { length: MAX_HISTORY_MESSAGES + 1 },
      () => QUESTION,
    );
    expect(expectInvalid({ provider: "gemini", messages })).toContain(
      `tối đa ${MAX_HISTORY_MESSAGES}`,
    );
  });

  test("chấp nhận đúng bằng giới hạn lịch sử", () => {
    const messages = Array.from(
      { length: MAX_HISTORY_MESSAGES },
      () => QUESTION,
    );
    expect(parseAssistantRequest({ provider: "gemini", messages }).type).toBe(
      "valid",
    );
  });

  test("báo đúng vị trí tin nhắn sai vai trò hoặc nội dung", () => {
    expect(
      expectInvalid({
        provider: "gemini",
        messages: [QUESTION, { role: "system", content: "x" }],
      }),
    ).toBe("Tin nhắn thứ 2 không đúng định dạng.");
    expect(
      expectInvalid({ provider: "gemini", messages: [{ role: "user" }] }),
    ).toBe("Tin nhắn thứ 1 không có nội dung dạng chữ.");
    expect(
      expectInvalid({
        provider: "gemini",
        messages: [{ role: "user", content: "   " }],
      }),
    ).toBe("Tin nhắn thứ 1 đang để trống.");
  });

  test("giới hạn độ dài riêng cho câu hỏi và câu trả lời", () => {
    expect(
      parseAssistantRequest({
        provider: "gemini",
        messages: [{ role: "user", content: "a".repeat(MAX_QUESTION_LENGTH) }],
      }).type,
    ).toBe("valid");
    expect(
      expectInvalid({
        provider: "gemini",
        messages: [
          { role: "user", content: "a".repeat(MAX_QUESTION_LENGTH + 1) },
        ],
      }),
    ).toContain(`giới hạn ${MAX_QUESTION_LENGTH}`);
    expect(
      parseAssistantRequest({
        provider: "gemini",
        messages: [
          QUESTION,
          { role: "assistant", content: "b".repeat(MAX_ANSWER_LENGTH) },
          QUESTION,
        ],
      }).type,
    ).toBe("valid");
    expect(
      expectInvalid({
        provider: "gemini",
        messages: [
          QUESTION,
          { role: "assistant", content: "b".repeat(MAX_ANSWER_LENGTH + 1) },
          QUESTION,
        ],
      }),
    ).toContain(`giới hạn ${MAX_ANSWER_LENGTH}`);
  });

  test("tin nhắn cuối phải là câu hỏi của người dùng", () => {
    expect(
      expectInvalid({
        provider: "gemini",
        messages: [QUESTION, { role: "assistant", content: "Trả lời" }],
      }),
    ).toBe("Tin nhắn cuối cùng phải là câu hỏi của người dùng.");
  });
});
