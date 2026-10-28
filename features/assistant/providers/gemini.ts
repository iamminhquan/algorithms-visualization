import { ApiError, FinishReason, GoogleGenAI } from "@google/genai";
import type {
  AssistantFinishReason,
  IAssistantMessage,
} from "@/engine/assistant";
import {
  AssistantProviderError,
  failureFromStatus,
  type IAssistantProvider,
  type IProviderRequest,
  type ProviderChunk,
} from "./types";

export const GEMINI_DEFAULT_MODEL = "gemini-flash-latest";

const REQUEST_TIMEOUT_MS = 60_000;

const BLOCKED_FINISH_REASONS: ReadonlySet<string> = new Set([
  FinishReason.SAFETY,
  FinishReason.RECITATION,
  FinishReason.BLOCKLIST,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.SPII,
]);

export interface IGeminiProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly baseURL?: string;
}

function toFinishReason(finishReason: string): AssistantFinishReason {
  if (finishReason === FinishReason.MAX_TOKENS) {
    return "truncated";
  }
  return BLOCKED_FINISH_REASONS.has(finishReason) ? "blocked" : "complete";
}

function toContent(message: IAssistantMessage) {
  return {
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  };
}

function toProviderError(
  error: unknown,
  signal: AbortSignal,
): AssistantProviderError {
  if (error instanceof AssistantProviderError) {
    return error;
  }
  if (signal.aborted) {
    return new AssistantProviderError(
      "gemini",
      "aborted",
      "Yêu cầu tới Gemini đã bị huỷ",
      { cause: error },
    );
  }
  if (error instanceof ApiError) {
    return new AssistantProviderError(
      "gemini",
      failureFromStatus(error.status),
      `Gemini trả về lỗi HTTP ${error.status}`,
      { cause: error },
    );
  }
  return new AssistantProviderError(
    "gemini",
    "unavailable",
    "Không kết nối được tới Gemini",
    { cause: error },
  );
}

export function createGeminiProvider({
  apiKey,
  model,
  baseURL,
}: IGeminiProviderOptions): IAssistantProvider {
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: { baseUrl: baseURL, timeout: REQUEST_TIMEOUT_MS },
  });

  async function* stream({
    system,
    messages,
    maxOutputTokens,
    signal,
  }: IProviderRequest): AsyncGenerator<ProviderChunk> {
    let finish: AssistantFinishReason = "complete";
    try {
      const chunks = await client.models.generateContentStream({
        model,
        contents: messages.map(toContent),
        config: {
          systemInstruction: system,
          maxOutputTokens,
          abortSignal: signal,
        },
      });
      for await (const chunk of chunks) {
        if (chunk.promptFeedback?.blockReason !== undefined) {
          finish = "blocked";
        }
        const text = chunk.text;
        if (text !== undefined && text !== "") {
          yield { type: "text", text };
        }
        const finishReason = chunk.candidates?.[0]?.finishReason;
        if (finishReason !== undefined) {
          finish = toFinishReason(finishReason);
        }
      }
    } catch (error) {
      throw toProviderError(error, signal);
    }
    yield { type: "finish", finish };
  }

  return { id: "gemini", stream };
}
