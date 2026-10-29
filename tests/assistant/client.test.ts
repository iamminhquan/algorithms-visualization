import { describe, expect, test } from "bun:test";
import {
  ASSISTANT_CLIENT_MESSAGES,
  ASSISTANT_ENDPOINT,
  requestAssistantReply,
} from "@/components/visualization/assistant-client";
import {
  type AssistantStreamEvent,
  createErrorBody,
  encodeStreamEvent,
  type IAssistantRequest,
} from "@/engine/assistant";

const REQUEST: IAssistantRequest = {
  provider: "deepseek",
  messages: [{ role: "user", content: "Bubble Sort là gì?" }],
};

interface IRecorder {
  readonly starts: unknown[][];
  readonly texts: string[];
}

function createRecorder(): IRecorder & {
  readonly onStart: (...args: unknown[]) => void;
  readonly onText: (text: string) => void;
} {
  const starts: unknown[][] = [];
  const texts: string[] = [];
  return {
    starts,
    texts,
    onStart: (...args) => starts.push(args),
    onText: (text) => texts.push(text),
  };
}

function streamResponse(chunks: readonly Uint8Array[]): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    }),
    { headers: { "content-type": "application/x-ndjson" } },
  );
}

function encodeEvents(events: readonly AssistantStreamEvent[]): Uint8Array {
  return new TextEncoder().encode(events.map(encodeStreamEvent).join(""));
}

function fakeFetch(
  response: Response | (() => Promise<Response>),
  calls: { url: string; init: RequestInit | undefined }[] = [],
): typeof fetch {
  const implementation = async (
    input: Parameters<typeof fetch>[0],
    init?: RequestInit,
  ) => {
    calls.push({ url: String(input), init });
    return typeof response === "function" ? response() : response;
  };
  return Object.assign(implementation, { preconnect: () => undefined });
}

describe("requestAssistantReply", () => {
  test("gửi POST JSON tới /api/assistant kèm signal", async () => {
    const calls: { url: string; init: RequestInit | undefined }[] = [];
    const controller = new AbortController();
    const recorder = createRecorder();
    await requestAssistantReply(REQUEST, {
      ...recorder,
      signal: controller.signal,
      fetcher: fakeFetch(
        streamResponse([
          encodeEvents([
            { type: "start", provider: "deepseek" },
            { type: "done", finish: "complete" },
          ]),
        ]),
        calls,
      ),
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(ASSISTANT_ENDPOINT);
    expect(calls[0]?.init?.method).toBe("POST");
    expect(calls[0]?.init?.signal).toBe(controller.signal);
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual(REQUEST);
  });

  test("đọc đúng chữ tiếng Việt khi byte UTF-8 bị cắt giữa các chunk", async () => {
    const bytes = encodeEvents([
      { type: "start", provider: "gemini", fallbackFrom: "deepseek" },
      { type: "text", text: "Mảng đã được sắp xếp tăng dần." },
      { type: "text", text: " Độ phức tạp O(n²)." },
      { type: "done", finish: "complete" },
    ]);
    const chunks = Array.from({ length: Math.ceil(bytes.length / 3) }, (_, i) =>
      bytes.slice(i * 3, i * 3 + 3),
    );
    const recorder = createRecorder();
    const outcome = await requestAssistantReply(REQUEST, {
      ...recorder,
      signal: new AbortController().signal,
      fetcher: fakeFetch(streamResponse(chunks)),
    });
    expect(outcome).toEqual({ type: "completed", finish: "complete" });
    expect(recorder.starts).toEqual([["gemini", "deepseek"]]);
    expect(recorder.texts.join("")).toBe(
      "Mảng đã được sắp xếp tăng dần. Độ phức tạp O(n²).",
    );
  });

  test("lỗi HTTP dùng thông báo máy chủ gửi về", async () => {
    const outcome = await requestAssistantReply(REQUEST, {
      ...createRecorder(),
      signal: new AbortController().signal,
      fetcher: fakeFetch(
        Response.json(
          createErrorBody({ code: "rate-limited", message: "Chậm lại nhé" }),
          { status: 429 },
        ),
      ),
    });
    expect(outcome).toEqual({ type: "failed", message: "Chậm lại nhé" });
  });

  test("lỗi HTTP không có body đúng dạng thì báo kèm mã lỗi", async () => {
    const outcome = await requestAssistantReply(REQUEST, {
      ...createRecorder(),
      signal: new AbortController().signal,
      fetcher: fakeFetch(new Response("<html>", { status: 500 })),
    });
    expect(outcome).toEqual({
      type: "failed",
      message: "Trợ lý AI gặp lỗi (HTTP 500), bạn thử lại sau nhé.",
    });
  });

  test("sự kiện error trong stream thành kết quả failed", async () => {
    const recorder = createRecorder();
    const outcome = await requestAssistantReply(REQUEST, {
      ...recorder,
      signal: new AbortController().signal,
      fetcher: fakeFetch(
        streamResponse([
          encodeEvents([
            { type: "start", provider: "deepseek" },
            { type: "text", text: "Một phần" },
            { type: "error", code: "interrupted", message: "Bị gián đoạn" },
          ]),
        ]),
      ),
    });
    expect(outcome).toEqual({ type: "failed", message: "Bị gián đoạn" });
    expect(recorder.texts).toEqual(["Một phần"]);
  });

  test("stream kết thúc mà không có done thì coi là gián đoạn", async () => {
    const outcome = await requestAssistantReply(REQUEST, {
      ...createRecorder(),
      signal: new AbortController().signal,
      fetcher: fakeFetch(
        streamResponse([encodeEvents([{ type: "text", text: "Dở dang" }])]),
      ),
    });
    expect(outcome).toEqual({
      type: "failed",
      message: ASSISTANT_CLIENT_MESSAGES.interrupted,
    });
  });

  test("sự kiện done ở dòng cuối không có ký tự xuống dòng vẫn được nhận", async () => {
    const outcome = await requestAssistantReply(REQUEST, {
      ...createRecorder(),
      signal: new AbortController().signal,
      fetcher: fakeFetch(
        streamResponse([
          new TextEncoder().encode('{"type":"done","finish":"blocked"}'),
        ]),
      ),
    });
    expect(outcome).toEqual({ type: "completed", finish: "blocked" });
  });

  test("mất mạng thì báo không kết nối được", async () => {
    const outcome = await requestAssistantReply(REQUEST, {
      ...createRecorder(),
      signal: new AbortController().signal,
      fetcher: fakeFetch(() =>
        Promise.reject(new TypeError("Failed to fetch")),
      ),
    });
    expect(outcome).toEqual({
      type: "failed",
      message: ASSISTANT_CLIENT_MESSAGES.network,
    });
  });

  test("người dùng huỷ trước khi có phản hồi thì trả aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const outcome = await requestAssistantReply(REQUEST, {
      ...createRecorder(),
      signal: controller.signal,
      fetcher: fakeFetch(() =>
        Promise.reject(new DOMException("Aborted", "AbortError")),
      ),
    });
    expect(outcome).toEqual({ type: "aborted" });
  });

  test("người dùng huỷ khi đang đọc stream thì trả aborted", async () => {
    const controller = new AbortController();
    const body = new ReadableStream<Uint8Array>({
      start(streamController) {
        streamController.enqueue(
          encodeEvents([{ type: "start", provider: "deepseek" }]),
        );
        controller.signal.addEventListener("abort", () =>
          streamController.error(new DOMException("Aborted", "AbortError")),
        );
      },
    });
    const recorder = createRecorder();
    const outcome = requestAssistantReply(REQUEST, {
      ...recorder,
      onStart: (...args) => {
        recorder.onStart(...args);
        controller.abort();
      },
      signal: controller.signal,
      fetcher: fakeFetch(new Response(body)),
    });
    expect(await outcome).toEqual({ type: "aborted" });
  });
});
