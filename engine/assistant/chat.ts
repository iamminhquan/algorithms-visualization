import { MAX_ANSWER_LENGTH, MAX_HISTORY_MESSAGES } from "./limits";
import type { AssistantFinishReason } from "./stream-protocol";
import {
  type AssistantProviderId,
  type AssistantRole,
  DEFAULT_ASSISTANT_PROVIDER,
  type IAssistantContext,
  type IAssistantMessage,
} from "./types";

export type ChatMessageStatus = "streaming" | "done" | "stopped" | "error";

export interface IChatMessage {
  readonly id: string;
  readonly role: AssistantRole;
  readonly content: string;
  readonly status: ChatMessageStatus;
  readonly provider?: AssistantProviderId;
  readonly fallbackFrom?: AssistantProviderId;
  readonly finish?: AssistantFinishReason;
  readonly error?: string;
  readonly context?: IAssistantContext;
}

export interface IChatState {
  readonly provider: AssistantProviderId;
  readonly messages: readonly IChatMessage[];
}

export type ChatAction =
  | { readonly type: "set-provider"; readonly provider: AssistantProviderId }
  | {
      readonly type: "send";
      readonly userId: string;
      readonly assistantId: string;
      readonly question: string;
      readonly context?: IAssistantContext;
    }
  | {
      readonly type: "retry";
      readonly failedId: string;
      readonly assistantId: string;
    }
  | {
      readonly type: "start";
      readonly id: string;
      readonly provider: AssistantProviderId;
      readonly fallbackFrom?: AssistantProviderId;
    }
  | { readonly type: "append"; readonly id: string; readonly text: string }
  | {
      readonly type: "finish";
      readonly id: string;
      readonly finish: AssistantFinishReason;
    }
  | { readonly type: "fail"; readonly id: string; readonly message: string }
  | { readonly type: "stop"; readonly id: string }
  | { readonly type: "reset" };

export function createChatState(
  provider: AssistantProviderId = DEFAULT_ASSISTANT_PROVIDER,
): IChatState {
  return { provider, messages: [] };
}

export function isChatStreaming(state: IChatState): boolean {
  return state.messages.some((message) => message.status === "streaming");
}

function createPlaceholder(id: string): IChatMessage {
  return { id, role: "assistant", content: "", status: "streaming" };
}

function updateStreaming(
  state: IChatState,
  id: string,
  update: (message: IChatMessage) => IChatMessage,
): IChatState {
  let updated = false;
  const messages = state.messages.map((message) => {
    if (message.id !== id || message.status !== "streaming") {
      return message;
    }
    updated = true;
    return update(message);
  });
  return updated ? { ...state, messages } : state;
}

export function chatReducer(state: IChatState, action: ChatAction): IChatState {
  switch (action.type) {
    case "set-provider":
      return { ...state, provider: action.provider };
    case "send": {
      const question = action.question.trim();
      if (question === "" || isChatStreaming(state)) {
        return state;
      }
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.userId,
            role: "user",
            content: question,
            status: "done",
            context: action.context,
          },
          createPlaceholder(action.assistantId),
        ],
      };
    }
    case "retry": {
      const last = state.messages.at(-1);
      if (last?.id !== action.failedId || last.status !== "error") {
        return state;
      }
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, -1),
          createPlaceholder(action.assistantId),
        ],
      };
    }
    case "start":
      return updateStreaming(state, action.id, (message) => ({
        ...message,
        provider: action.provider,
        fallbackFrom: action.fallbackFrom,
      }));
    case "append":
      return updateStreaming(state, action.id, (message) => ({
        ...message,
        content: `${message.content}${action.text}`,
      }));
    case "finish":
      return updateStreaming(state, action.id, (message) => ({
        ...message,
        status: "done",
        finish: action.finish,
      }));
    case "fail":
      return updateStreaming(state, action.id, (message) => ({
        ...message,
        status: "error",
        error: action.message,
      }));
    case "stop":
      return updateStreaming(state, action.id, (message) => ({
        ...message,
        status: "stopped",
      }));
    case "reset":
      return createChatState(state.provider);
    default: {
      const unreachable: never = action;
      throw new Error(
        `Thao tác chat không hợp lệ: ${JSON.stringify(unreachable)}`,
      );
    }
  }
}

function isUsableInHistory(message: IChatMessage): boolean {
  if (message.content.trim() === "") {
    return false;
  }
  return message.role === "user"
    ? message.status === "done"
    : message.status === "done" || message.status === "stopped";
}

function isAnsweredOrLatest(
  message: IChatMessage,
  index: number,
  messages: readonly IChatMessage[],
): boolean {
  if (message.role === "assistant" || index === messages.length - 1) {
    return true;
  }
  const next = messages[index + 1];
  return next?.role === "assistant" && isUsableInHistory(next);
}

export function buildChatHistory(
  messages: readonly IChatMessage[],
): IAssistantMessage[] {
  return messages
    .filter(
      (message, index) =>
        isUsableInHistory(message) &&
        isAnsweredOrLatest(message, index, messages),
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_ANSWER_LENGTH),
    }))
    .slice(-MAX_HISTORY_MESSAGES);
}
