import {
  type AssistantFinishReason,
  type AssistantProviderId,
  createStreamEventParser,
  type IAssistantRequest,
  parseErrorBody,
} from "@/engine/assistant";

export const ASSISTANT_ENDPOINT = "/api/assistant";

export const ASSISTANT_CLIENT_MESSAGES = {
  network: "Không kết nối được tới máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.",
  interrupted: "Câu trả lời bị gián đoạn giữa chừng, bạn thử hỏi lại nhé.",
  emptyBody: "Máy chủ không gửi câu trả lời nào, bạn thử lại nhé.",
} as const;

export interface IAssistantReplyHandlers {
  readonly onStart: (
    provider: AssistantProviderId,
    fallbackFrom?: AssistantProviderId,
  ) => void;
  readonly onText: (text: string) => void;
}

export type AssistantReplyOutcome =
  | { readonly type: "completed"; readonly finish: AssistantFinishReason }
  | { readonly type: "aborted" }
  | { readonly type: "failed"; readonly message: string };

export interface IAssistantReplyOptions extends IAssistantReplyHandlers {
  readonly signal: AbortSignal;
  readonly fetcher?: typeof fetch;
}

function failed(message: string): AssistantReplyOutcome {
  return { type: "failed", message };
}

async function readErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => undefined);
  return (
    parseErrorBody(body)?.message ??
    `Trợ lý AI gặp lỗi (HTTP ${response.status}), bạn thử lại sau nhé.`
  );
}

export async function requestAssistantReply(
  request: IAssistantRequest,
  { signal, onStart, onText, fetcher = fetch }: IAssistantReplyOptions,
): Promise<AssistantReplyOutcome> {
  let response: Response;
  try {
    response = await fetcher(ASSISTANT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch {
    return signal.aborted
      ? { type: "aborted" }
      : failed(ASSISTANT_CLIENT_MESSAGES.network);
  }

  if (!response.ok) {
    return failed(await readErrorMessage(response));
  }
  if (response.body === null) {
    return failed(ASSISTANT_CLIENT_MESSAGES.emptyBody);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = createStreamEventParser();

  try {
    for (;;) {
      const { done, value } = await reader.read();
      const events = done
        ? [...parser.push(decoder.decode()), ...parser.flush()]
        : parser.push(decoder.decode(value, { stream: true }));
      for (const event of events) {
        switch (event.type) {
          case "start":
            onStart(event.provider, event.fallbackFrom);
            break;
          case "text":
            onText(event.text);
            break;
          case "done":
            await reader.cancel();
            return { type: "completed", finish: event.finish };
          case "error":
            await reader.cancel();
            return failed(event.message);
          default: {
            const unreachable: never = event;
            throw new Error(
              `Sự kiện không hợp lệ: ${JSON.stringify(unreachable)}`,
            );
          }
        }
      }
      if (done) {
        return failed(ASSISTANT_CLIENT_MESSAGES.interrupted);
      }
    }
  } catch {
    return signal.aborted
      ? { type: "aborted" }
      : failed(ASSISTANT_CLIENT_MESSAGES.interrupted);
  }
}
