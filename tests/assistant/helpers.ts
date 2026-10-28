import {
  type AssistantProviderId,
  type AssistantStreamEvent,
  createStreamEventParser,
} from "@/engine/assistant";
import {
  AssistantProviderError,
  type IAssistantProvider,
  type IProviderRequest,
  type ProviderChunk,
  type ProviderFailure,
} from "@/features/assistant/providers/types";

export interface IFakeProviderScript {
  readonly chunks?: readonly ProviderChunk[];
  readonly failBefore?: ProviderFailure;
  readonly failAfterChunks?: number;
  readonly waitForAbortAfterChunks?: number;
}

export interface IFakeProvider extends IAssistantProvider {
  readonly requests: IProviderRequest[];
}

export const DEFAULT_CHUNKS: readonly ProviderChunk[] = [
  { type: "text", text: "Xin " },
  { type: "text", text: "chào" },
  { type: "finish", finish: "complete" },
];

function waitForAbort(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    signal.addEventListener("abort", () => resolve(), { once: true });
  });
}

export function createFakeProvider(
  id: AssistantProviderId,
  script: IFakeProviderScript = {},
): IFakeProvider {
  const requests: IProviderRequest[] = [];
  async function* stream(
    request: IProviderRequest,
  ): AsyncGenerator<ProviderChunk> {
    requests.push(request);
    if (script.failBefore !== undefined) {
      throw new AssistantProviderError(
        id,
        script.failBefore,
        `${id} lỗi ${script.failBefore}`,
      );
    }
    for (const [index, chunk] of (script.chunks ?? DEFAULT_CHUNKS).entries()) {
      if (index === script.failAfterChunks) {
        throw new AssistantProviderError(
          id,
          "unavailable",
          `${id} đứt kết nối`,
        );
      }
      if (index === script.waitForAbortAfterChunks) {
        await waitForAbort(request.signal);
        throw new AssistantProviderError(id, "aborted", `${id} bị huỷ`);
      }
      yield chunk;
    }
  }
  return { id, stream, requests };
}

export async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

export async function readStreamEvents(
  response: Response,
): Promise<AssistantStreamEvent[]> {
  const parser = createStreamEventParser();
  const events = parser.push(await response.text());
  return [...events, ...parser.flush()];
}

export function createProviderRequest(
  overrides: Partial<IProviderRequest> = {},
): IProviderRequest {
  return {
    system: "Hệ thống",
    messages: [{ role: "user", content: "Bubble Sort là gì?" }],
    maxOutputTokens: 256,
    signal: new AbortController().signal,
    ...overrides,
  };
}

export function createAssistantHttpRequest(
  body: unknown,
  init: RequestInit = {},
): Request {
  return new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}
