import Anthropic, {
  APIConnectionError,
  APIError,
  APIUserAbortError,
} from "@anthropic-ai/sdk";
import type { AssistantFinishReason } from "@/engine/assistant";
import {
  AssistantProviderError,
  failureFromStatus,
  type IAssistantProvider,
  type IProviderRequest,
  type ProviderChunk,
} from "./types";

export const DEEPSEEK_BASE_URL = "https://api.deepseek.com/anthropic";
export const DEEPSEEK_DEFAULT_MODEL = "deepseek-v4-flash";

const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 1;
const API_KEY_HEADER = "x-api-key";

export interface IDeepSeekProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly baseURL?: string;
}

function toFinishReason(
  stopReason: string | null | undefined,
): AssistantFinishReason {
  if (stopReason === "max_tokens") {
    return "truncated";
  }
  if (stopReason === "refusal") {
    return "blocked";
  }
  return "complete";
}

function toProviderError(
  error: unknown,
  signal: AbortSignal,
): AssistantProviderError {
  if (error instanceof AssistantProviderError) {
    return error;
  }
  if (signal.aborted || error instanceof APIUserAbortError) {
    return new AssistantProviderError(
      "deepseek",
      "aborted",
      "Yêu cầu tới DeepSeek đã bị huỷ",
      { cause: error },
    );
  }
  if (error instanceof APIConnectionError) {
    return new AssistantProviderError(
      "deepseek",
      "unavailable",
      "Không kết nối được tới DeepSeek",
      { cause: error },
    );
  }
  if (error instanceof APIError && error.status !== undefined) {
    return new AssistantProviderError(
      "deepseek",
      failureFromStatus(error.status),
      `DeepSeek trả về lỗi HTTP ${error.status}`,
      { cause: error },
    );
  }
  return new AssistantProviderError(
    "deepseek",
    "unavailable",
    "DeepSeek gặp lỗi không xác định",
    { cause: error },
  );
}

export function createDeepSeekProvider({
  apiKey,
  model,
  baseURL = DEEPSEEK_BASE_URL,
}: IDeepSeekProviderOptions): IAssistantProvider {
  const client = new Anthropic({
    apiKey,
    authToken: null,
    baseURL,
    defaultHeaders: { [API_KEY_HEADER]: apiKey },
    maxRetries: MAX_RETRIES,
    timeout: REQUEST_TIMEOUT_MS,
  });

  async function* stream({
    system,
    messages,
    maxOutputTokens,
    signal,
  }: IProviderRequest): AsyncGenerator<ProviderChunk> {
    let stopReason: string | null | undefined;
    try {
      const events = client.messages.stream(
        {
          model,
          max_tokens: maxOutputTokens,
          system,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        },
        { signal },
      );
      for await (const event of events) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta" &&
          event.delta.text !== ""
        ) {
          yield { type: "text", text: event.delta.text };
        } else if (event.type === "message_delta") {
          stopReason = event.delta.stop_reason;
        }
      }
    } catch (error) {
      throw toProviderError(error, signal);
    }
    yield { type: "finish", finish: toFinishReason(stopReason) };
  }

  return { id: "deepseek", stream };
}
