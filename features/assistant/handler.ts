import {
  ASSISTANT_STREAM_CONTENT_TYPE,
  type AssistantErrorCode,
  type AssistantStreamEvent,
  createErrorBody,
  encodeStreamEvent,
  MAX_OUTPUT_TOKENS,
  MAX_REQUEST_BYTES,
} from "@/engine/assistant";
import { normalizeConversation } from "./conversation";
import {
  AllProvidersFailedError,
  type IOpenedProviderStream,
  NoProviderConfiguredError,
  openProviderStream,
} from "./fallback";
import { buildSystemPrompt } from "./prompt";
import {
  AssistantProviderError,
  type IAssistantProvider,
} from "./providers/types";
import { parseAssistantRequest } from "./validate";

export interface IAssistantDependencies {
  readonly providers: readonly IAssistantProvider[];
}

type BodyReadResult =
  | { readonly type: "valid"; readonly body: unknown }
  | {
      readonly type: "invalid";
      readonly status: number;
      readonly code: AssistantErrorCode;
      readonly message: string;
    };

const CLIENT_CLOSED_REQUEST_STATUS = 499;

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

const STREAM_HEADERS = {
  ...NO_STORE_HEADERS,
  "Content-Type": `${ASSISTANT_STREAM_CONTENT_TYPE}; charset=utf-8`,
  "X-Accel-Buffering": "no",
} as const;

const MESSAGES = {
  invalidJson: "Yêu cầu gửi lên không phải JSON hợp lệ.",
  tooLarge: "Yêu cầu gửi lên quá lớn.",
  notConfigured: "Trợ lý AI chưa được cấu hình trên máy chủ.",
  busy: "Trợ lý AI đang quá tải, bạn thử lại sau ít phút nhé.",
  unavailable:
    "Trợ lý AI tạm thời không trả lời được, bạn thử lại sau ít phút nhé.",
  interrupted: "Câu trả lời bị gián đoạn giữa chừng, bạn thử hỏi lại nhé.",
} as const;

function errorResponse(
  status: number,
  code: AssistantErrorCode,
  message: string,
): Response {
  return Response.json(createErrorBody({ code, message }), {
    status,
    headers: NO_STORE_HEADERS,
  });
}

async function readJsonBody(request: Request): Promise<BodyReadResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return {
      type: "invalid",
      status: 413,
      code: "payload-too-large",
      message: MESSAGES.tooLarge,
    };
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) {
    return {
      type: "invalid",
      status: 413,
      code: "payload-too-large",
      message: MESSAGES.tooLarge,
    };
  }
  try {
    return { type: "valid", body: JSON.parse(text) };
  } catch {
    return {
      type: "invalid",
      status: 400,
      code: "invalid-request",
      message: MESSAGES.invalidJson,
    };
  }
}

function logFailure(error: unknown): void {
  if (error instanceof AllProvidersFailedError) {
    for (const failure of error.failures) {
      console.error(
        `[assistant] ${failure.provider} (${failure.failure}): ${failure.message}`,
      );
    }
    return;
  }
  console.error("[assistant]", error);
}

function failureResponse(error: unknown): Response {
  if (error instanceof AssistantProviderError && error.failure === "aborted") {
    return new Response(null, { status: CLIENT_CLOSED_REQUEST_STATUS });
  }
  logFailure(error);
  if (error instanceof NoProviderConfiguredError) {
    return errorResponse(503, "not-configured", MESSAGES.notConfigured);
  }
  if (
    error instanceof AllProvidersFailedError &&
    error.failures.every((failure) => failure.failure === "rate-limited")
  ) {
    return errorResponse(503, "provider-unavailable", MESSAGES.busy);
  }
  return errorResponse(502, "provider-unavailable", MESSAGES.unavailable);
}

async function* toStreamEvents(
  opened: IOpenedProviderStream,
  signal: AbortSignal,
): AsyncGenerator<AssistantStreamEvent> {
  yield opened.fallbackFrom === undefined
    ? { type: "start", provider: opened.provider }
    : {
        type: "start",
        provider: opened.provider,
        fallbackFrom: opened.fallbackFrom,
      };

  let chunk = opened.first;
  try {
    while (chunk.type === "text") {
      yield { type: "text", text: chunk.text };
      const next = await opened.rest.next();
      if (next.done) {
        yield { type: "done", finish: "complete" };
        return;
      }
      chunk = next.value;
    }
    yield { type: "done", finish: chunk.finish };
  } catch (error) {
    if (signal.aborted) {
      return;
    }
    logFailure(error);
    yield { type: "error", code: "interrupted", message: MESSAGES.interrupted };
  }
}

function toReadableStream(
  events: AsyncGenerator<AssistantStreamEvent>,
  onCancel: () => void,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const next = await events.next();
      if (next.done) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(encodeStreamEvent(next.value)));
    },
    cancel() {
      onCancel();
    },
  });
}

export async function handleAssistantRequest(
  request: Request,
  { providers }: IAssistantDependencies,
): Promise<Response> {
  const body = await readJsonBody(request);
  if (body.type === "invalid") {
    return errorResponse(body.status, body.code, body.message);
  }
  const parsed = parseAssistantRequest(body.body);
  if (parsed.type === "invalid") {
    return errorResponse(400, "invalid-request", parsed.message);
  }

  const abortController = new AbortController();
  const abort = () => abortController.abort();
  if (request.signal.aborted) {
    abort();
  } else {
    request.signal.addEventListener("abort", abort, { once: true });
  }

  let opened: IOpenedProviderStream;
  try {
    opened = await openProviderStream(providers, parsed.request.provider, {
      system: buildSystemPrompt(),
      messages: normalizeConversation(parsed.request.messages),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      signal: abortController.signal,
    });
  } catch (error) {
    return failureResponse(error);
  }

  return new Response(
    toReadableStream(toStreamEvents(opened, abortController.signal), abort),
    { headers: STREAM_HEADERS },
  );
}
