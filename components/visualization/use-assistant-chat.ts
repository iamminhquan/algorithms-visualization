import { useEffect, useReducer, useRef } from "react";
import {
  type AssistantProviderId,
  buildChatHistory,
  chatReducer,
  createChatState,
  type IChatMessage,
  isChatStreaming,
} from "@/engine/assistant";
import { requestAssistantReply } from "./assistant-client";

export interface IAssistantChat {
  readonly provider: AssistantProviderId;
  readonly messages: readonly IChatMessage[];
  readonly isStreaming: boolean;
  readonly send: (question: string) => void;
  readonly stop: () => void;
  readonly retry: () => void;
  readonly reset: () => void;
  readonly setProvider: (provider: AssistantProviderId) => void;
}

function createMessageId(): string {
  return crypto.randomUUID();
}

export function useAssistantChat(): IAssistantChat {
  const [state, dispatch] = useReducer(chatReducer, undefined, () =>
    createChatState(),
  );
  const abortRef = useRef<AbortController | undefined>(undefined);
  const isStreaming = isChatStreaming(state);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = async (assistantId: string, history: readonly IChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const outcome = await requestAssistantReply(
      { provider: state.provider, messages: buildChatHistory(history) },
      {
        signal: controller.signal,
        onStart: (provider, fallbackFrom) =>
          dispatch({ type: "start", id: assistantId, provider, fallbackFrom }),
        onText: (text) => dispatch({ type: "append", id: assistantId, text }),
      },
    );
    if (abortRef.current === controller) {
      abortRef.current = undefined;
    }
    switch (outcome.type) {
      case "completed":
        dispatch({ type: "finish", id: assistantId, finish: outcome.finish });
        break;
      case "aborted":
        dispatch({ type: "stop", id: assistantId });
        break;
      case "failed":
        dispatch({ type: "fail", id: assistantId, message: outcome.message });
        break;
      default: {
        const unreachable: never = outcome;
        throw new Error(`Kết quả không hợp lệ: ${JSON.stringify(unreachable)}`);
      }
    }
  };

  const send = (question: string) => {
    const content = question.trim();
    if (content === "" || isStreaming) {
      return;
    }
    const userMessage: IChatMessage = {
      id: createMessageId(),
      role: "user",
      content,
      status: "done",
    };
    const assistantId = createMessageId();
    dispatch({
      type: "send",
      userId: userMessage.id,
      assistantId,
      question: content,
    });
    void run(assistantId, [...state.messages, userMessage]);
  };

  const retry = () => {
    const failed = state.messages.at(-1);
    if (failed?.status !== "error" || isStreaming) {
      return;
    }
    const assistantId = createMessageId();
    dispatch({ type: "retry", failedId: failed.id, assistantId });
    void run(assistantId, state.messages.slice(0, -1));
  };

  return {
    provider: state.provider,
    messages: state.messages,
    isStreaming,
    send,
    stop: () => abortRef.current?.abort(),
    retry,
    reset: () => {
      abortRef.current?.abort();
      dispatch({ type: "reset" });
    },
    setProvider: (provider) => dispatch({ type: "set-provider", provider }),
  };
}
