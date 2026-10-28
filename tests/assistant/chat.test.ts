import { describe, expect, test } from "bun:test";
import {
  buildChatHistory,
  type ChatAction,
  chatReducer,
  createChatState,
  type IChatMessage,
  type IChatState,
  isChatStreaming,
  MAX_ANSWER_LENGTH,
  MAX_HISTORY_MESSAGES,
} from "@/engine/assistant";

function applyAll(
  state: IChatState,
  actions: readonly ChatAction[],
): IChatState {
  return actions.reduce(chatReducer, state);
}

const SEND: ChatAction = {
  type: "send",
  userId: "u1",
  assistantId: "a1",
  question: "  Bubble Sort là gì?  ",
};

describe("chatReducer", () => {
  test("bắt đầu rỗng với mô hình mặc định DeepSeek", () => {
    expect(createChatState()).toEqual({ provider: "deepseek", messages: [] });
  });

  test("send thêm câu hỏi đã cắt khoảng trắng và chỗ trống cho câu trả lời", () => {
    const state = chatReducer(createChatState(), SEND);
    expect(state.messages).toEqual([
      { id: "u1", role: "user", content: "Bubble Sort là gì?", status: "done" },
      { id: "a1", role: "assistant", content: "", status: "streaming" },
    ]);
    expect(isChatStreaming(state)).toBe(true);
  });

  test("bỏ qua câu hỏi rỗng và câu hỏi mới khi đang trả lời", () => {
    const initial = createChatState();
    expect(chatReducer(initial, { ...SEND, question: "   " })).toBe(initial);
    const streaming = chatReducer(initial, SEND);
    expect(
      chatReducer(streaming, { ...SEND, userId: "u2", assistantId: "a2" }),
    ).toBe(streaming);
  });

  test("start, append rồi finish dựng xong câu trả lời", () => {
    const state = applyAll(createChatState(), [
      SEND,
      { type: "start", id: "a1", provider: "gemini", fallbackFrom: "deepseek" },
      { type: "append", id: "a1", text: "Xin " },
      { type: "append", id: "a1", text: "chào" },
      { type: "finish", id: "a1", finish: "truncated" },
    ]);
    expect(state.messages[1]).toEqual({
      id: "a1",
      role: "assistant",
      content: "Xin chào",
      status: "done",
      provider: "gemini",
      fallbackFrom: "deepseek",
      finish: "truncated",
    });
    expect(isChatStreaming(state)).toBe(false);
  });

  test("bỏ qua sự kiện tới muộn sau khi đã dừng hoặc với id lạ", () => {
    const stopped = applyAll(createChatState(), [
      SEND,
      { type: "append", id: "a1", text: "Một phần" },
      { type: "stop", id: "a1" },
    ]);
    expect(stopped.messages[1]?.status).toBe("stopped");
    expect(
      applyAll(stopped, [
        { type: "append", id: "a1", text: " thừa" },
        { type: "finish", id: "a1", finish: "complete" },
        { type: "fail", id: "a1", message: "x" },
      ]),
    ).toBe(stopped);
    expect(
      chatReducer(stopped, { type: "append", id: "khác", text: "x" }),
    ).toBe(stopped);
  });

  test("fail giữ phần chữ đã nhận và ghi thông báo lỗi", () => {
    const state = applyAll(createChatState(), [
      SEND,
      { type: "append", id: "a1", text: "Đang" },
      { type: "fail", id: "a1", message: "Đứt kết nối" },
    ]);
    expect(state.messages[1]).toMatchObject({
      content: "Đang",
      status: "error",
      error: "Đứt kết nối",
    });
  });

  test("retry thay câu trả lời lỗi cuối cùng bằng chỗ trống mới", () => {
    const failed = applyAll(createChatState(), [
      SEND,
      { type: "fail", id: "a1", message: "Lỗi" },
    ]);
    const retried = chatReducer(failed, {
      type: "retry",
      failedId: "a1",
      assistantId: "a2",
    });
    expect(
      retried.messages.map((message) => [message.id, message.status]),
    ).toEqual([
      ["u1", "done"],
      ["a2", "streaming"],
    ]);
  });

  test("retry bị bỏ qua nếu tin nhắn cuối không phải lỗi hoặc sai id", () => {
    const done = applyAll(createChatState(), [
      SEND,
      { type: "finish", id: "a1", finish: "complete" },
    ]);
    expect(
      chatReducer(done, { type: "retry", failedId: "a1", assistantId: "a2" }),
    ).toBe(done);
    const failed = chatReducer(done, {
      ...SEND,
      userId: "u2",
      assistantId: "a2",
    });
    const failedState = chatReducer(failed, {
      type: "fail",
      id: "a2",
      message: "x",
    });
    expect(
      chatReducer(failedState, {
        type: "retry",
        failedId: "a1",
        assistantId: "a3",
      }),
    ).toBe(failedState);
  });

  test("đổi mô hình giữ nguyên hội thoại, reset xoá hội thoại nhưng giữ mô hình", () => {
    const state = applyAll(createChatState(), [
      SEND,
      { type: "set-provider", provider: "gemini" },
    ]);
    expect(state.provider).toBe("gemini");
    expect(state.messages).toHaveLength(2);
    expect(chatReducer(state, { type: "reset" })).toEqual({
      provider: "gemini",
      messages: [],
    });
  });
});

describe("buildChatHistory", () => {
  function message(overrides: Partial<IChatMessage>): IChatMessage {
    return {
      id: crypto.randomUUID(),
      role: "user",
      content: "câu hỏi",
      status: "done",
      ...overrides,
    };
  }

  test("chỉ giữ cặp hỏi đáp đã có câu trả lời, bỏ câu hỏi bị lỗi hoặc chưa được trả lời", () => {
    expect(
      buildChatHistory([
        message({ content: "q1" }),
        message({ role: "assistant", content: "a1" }),
        message({ content: "q2" }),
        message({ role: "assistant", content: "lỗi", status: "error" }),
        message({ content: "q3" }),
        message({ role: "assistant", content: "nửa", status: "stopped" }),
        message({ content: "q4" }),
        message({ role: "assistant", content: "", status: "stopped" }),
        message({ content: "q5" }),
        message({ role: "assistant", content: "  ", status: "done" }),
        message({ content: "q6" }),
      ]),
    ).toEqual([
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "q3" },
      { role: "assistant", content: "nửa" },
      { role: "user", content: "q6" },
    ]);
  });

  test("câu hỏi cuối luôn được giữ dù chưa có câu trả lời", () => {
    expect(
      buildChatHistory([
        message({ content: "q1" }),
        message({ role: "assistant", content: "a1" }),
        message({ content: "q2" }),
      ]),
    ).toEqual([
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "q2" },
    ]);
  });

  test(`chỉ gửi ${MAX_HISTORY_MESSAGES} tin nhắn gần nhất`, () => {
    const messages = Array.from({ length: MAX_HISTORY_MESSAGES + 5 }, (_, i) =>
      message(
        i % 2 === 0
          ? { content: `q${i}` }
          : { role: "assistant", content: `a${i}` },
      ),
    );
    const history = buildChatHistory(messages);
    expect(history).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(history.at(-1)?.content).toBe(`q${MAX_HISTORY_MESSAGES + 4}`);
  });

  test("cắt câu trả lời dài cho vừa giới hạn của máy chủ", () => {
    const [entry] = buildChatHistory([
      message({
        role: "assistant",
        content: "x".repeat(MAX_ANSWER_LENGTH + 50),
      }),
    ]);
    expect(entry?.content).toHaveLength(MAX_ANSWER_LENGTH);
  });
});
