import { describe, expect, test } from "bun:test";
import { normalizeConversation } from "@/features/assistant/conversation";

describe("normalizeConversation", () => {
  test("giữ nguyên hội thoại đã xen kẽ đúng", () => {
    const messages = [
      { role: "user", content: "a" },
      { role: "assistant", content: "b" },
      { role: "user", content: "c" },
    ] as const;
    expect(normalizeConversation(messages)).toEqual([...messages]);
  });

  test("bỏ các câu trả lời đứng trước câu hỏi đầu tiên", () => {
    expect(
      normalizeConversation([
        { role: "assistant", content: "chào" },
        { role: "assistant", content: "mời hỏi" },
        { role: "user", content: "hỏi" },
      ]),
    ).toEqual([{ role: "user", content: "hỏi" }]);
  });

  test("gộp các tin nhắn liên tiếp cùng vai trò", () => {
    expect(
      normalizeConversation([
        { role: "user", content: "a" },
        { role: "user", content: "b" },
        { role: "assistant", content: "c" },
        { role: "assistant", content: "d" },
        { role: "user", content: "e" },
      ]),
    ).toEqual([
      { role: "user", content: "a\n\nb" },
      { role: "assistant", content: "c\n\nd" },
      { role: "user", content: "e" },
    ]);
  });

  test("trả về rỗng khi không có câu hỏi nào", () => {
    expect(
      normalizeConversation([{ role: "assistant", content: "x" }]),
    ).toEqual([]);
    expect(normalizeConversation([])).toEqual([]);
  });

  test("không sửa mảng đầu vào", () => {
    const messages = [
      { role: "user", content: "a" },
      { role: "user", content: "b" },
    ] as const;
    const copy = structuredClone(messages);
    normalizeConversation(messages);
    expect(messages).toEqual(copy);
  });
});
