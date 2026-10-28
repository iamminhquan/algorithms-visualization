import {
  type AssistantRole,
  type IAssistantMessage,
  type IAssistantRequest,
  isAssistantProviderId,
  MAX_ANSWER_LENGTH,
  MAX_HISTORY_MESSAGES,
  MAX_QUESTION_LENGTH,
} from "@/engine/assistant";
import { isRecord } from "./guards";
import { parseAssistantContext } from "./validate-context";

export type AssistantRequestParseResult =
  | { readonly type: "valid"; readonly request: IAssistantRequest }
  | { readonly type: "invalid"; readonly message: string };

type MessageParseResult =
  | { readonly type: "valid"; readonly message: IAssistantMessage }
  | { readonly type: "invalid"; readonly message: string };

const MAX_CONTENT_LENGTH: Readonly<Record<AssistantRole, number>> = {
  user: MAX_QUESTION_LENGTH,
  assistant: MAX_ANSWER_LENGTH,
};

function isRole(value: unknown): value is AssistantRole {
  return value === "user" || value === "assistant";
}

function invalid(message: string): {
  readonly type: "invalid";
  readonly message: string;
} {
  return { type: "invalid", message };
}

function parseMessage(value: unknown, position: number): MessageParseResult {
  if (!isRecord(value) || !isRole(value.role)) {
    return invalid(`Tin nhắn thứ ${position} không đúng định dạng.`);
  }
  if (typeof value.content !== "string") {
    return invalid(`Tin nhắn thứ ${position} không có nội dung dạng chữ.`);
  }
  const content = value.content.trim();
  if (content === "") {
    return invalid(`Tin nhắn thứ ${position} đang để trống.`);
  }
  const limit = MAX_CONTENT_LENGTH[value.role];
  if (content.length > limit) {
    return invalid(
      `Tin nhắn thứ ${position} dài ${content.length} ký tự, vượt quá giới hạn ${limit}.`,
    );
  }
  return { type: "valid", message: { role: value.role, content } };
}

export function parseAssistantRequest(
  body: unknown,
): AssistantRequestParseResult {
  if (!isRecord(body)) {
    return invalid("Yêu cầu gửi lên không đúng định dạng.");
  }
  if (!isAssistantProviderId(body.provider)) {
    return invalid("Không nhận ra mô hình AI được chọn.");
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return invalid("Yêu cầu phải có ít nhất một tin nhắn.");
  }
  if (body.messages.length > MAX_HISTORY_MESSAGES) {
    return invalid(
      `Chỉ gửi được tối đa ${MAX_HISTORY_MESSAGES} tin nhắn, hiện có ${body.messages.length}.`,
    );
  }

  const messages: IAssistantMessage[] = [];
  for (const [index, value] of body.messages.entries()) {
    const result = parseMessage(value, index + 1);
    if (result.type === "invalid") {
      return result;
    }
    messages.push(result.message);
  }
  if (messages.at(-1)?.role !== "user") {
    return invalid("Tin nhắn cuối cùng phải là câu hỏi của người dùng.");
  }

  if (body.context === undefined) {
    return { type: "valid", request: { provider: body.provider, messages } };
  }
  const context = parseAssistantContext(body.context);
  if (context.type === "invalid") {
    return context;
  }
  return {
    type: "valid",
    request: { provider: body.provider, messages, context: context.context },
  };
}
