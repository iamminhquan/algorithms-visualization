import {
  type AssistantProviderId,
  type AssistantStreamEvent,
  createStreamEventParser,
  type IAssistantContext,
} from "@/engine/assistant";
import type { IAssistantAlgorithmInfo } from "@/features/assistant/prompt";
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

export const BUBBLE_SORT_INFO: IAssistantAlgorithmInfo = {
  key: "bubble-sort",
  name: "Sắp xếp nổi bọt (Bubble Sort)",
  categoryName: "Thuật toán sắp xếp",
  description: "So sánh và đổi chỗ hai phần tử kề nhau.",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(1)",
};

const COMPARE_PAYLOAD = { type: "compare", indices: [0, 1] } as const;

export const BUBBLE_SORT_CONTEXT: IAssistantContext = {
  algorithmKey: "bubble-sort",
  input: [38, 27, 43],
  step: {
    index: 1,
    total: 9,
    description: "Đang so sánh 38 và 27",
    payload: COMPARE_PAYLOAD,
    state: { array: [38, 27, 43], sortedIndices: [] },
  },
  pseudocode: [
    "lặp end từ n - 1 giảm về 1",
    "  lặp j từ 0 đến end - 1",
    "    nếu a[j] > a[j + 1]",
  ],
  activeLine: 2,
  metrics: [
    { label: "So sánh", value: 1 },
    { label: "Hoán đổi", value: 0 },
  ],
};
