import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { createGeminiProvider } from "@/features/assistant/providers/gemini";
import {
  AssistantProviderError,
  type ProviderFailure,
} from "@/features/assistant/providers/types";
import { collect, createProviderRequest } from "./helpers";

interface ICapturedRequest {
  readonly path: string;
  readonly search: string;
  readonly apiKey: string | null;
  readonly body: unknown;
}

type MockReply =
  | { readonly type: "stream"; readonly chunks: readonly unknown[] }
  | { readonly type: "error"; readonly status: number }
  | { readonly type: "hang" };

const captured: ICapturedRequest[] = [];
let reply: MockReply = { type: "stream", chunks: [] };
let server: ReturnType<typeof Bun.serve>;

function textChunk(text: string, finishReason?: string): unknown {
  return {
    candidates: [
      {
        content: { role: "model", parts: [{ text }] },
        index: 0,
        ...(finishReason === undefined ? {} : { finishReason }),
      },
    ],
  };
}

function toSse(chunks: readonly unknown[]): string {
  return chunks
    .map((chunk) => `data: ${JSON.stringify(chunk)}\r\n\r\n`)
    .join("");
}

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);
      captured.push({
        path: url.pathname,
        search: url.search,
        apiKey: request.headers.get("x-goog-api-key"),
        body: await request.json(),
      });
      if (reply.type === "error") {
        return Response.json(
          { error: { code: reply.status, message: "lỗi giả", status: "ERR" } },
          { status: reply.status },
        );
      }
      if (reply.type === "hang") {
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(toSse([textChunk("Đang ")])),
              );
            },
          }),
          { headers: { "content-type": "text/event-stream" } },
        );
      }
      return new Response(toSse(reply.chunks), {
        headers: { "content-type": "text/event-stream" },
      });
    },
  });
});

afterAll(() => {
  server.stop(true);
});

beforeEach(() => {
  captured.length = 0;
});

function createProvider() {
  return createGeminiProvider({
    apiKey: "gm-test-key",
    model: "gemini-test",
    baseURL: server.url.toString(),
  });
}

describe("createGeminiProvider qua @google/genai", () => {
  test("gọi streamGenerateContent với API key, system instruction và vai trò model", async () => {
    reply = { type: "stream", chunks: [textChunk("Ok", "STOP")] };
    await collect(
      createProvider().stream(
        createProviderRequest({
          system: "Quy tắc",
          maxOutputTokens: 300,
          messages: [
            { role: "user", content: "Hỏi" },
            { role: "assistant", content: "Đáp" },
            { role: "user", content: "Hỏi tiếp" },
          ],
        }),
      ),
    );
    expect(captured).toHaveLength(1);
    expect(captured[0]?.path).toBe(
      "/v1beta/models/gemini-test:streamGenerateContent",
    );
    expect(captured[0]?.search).toBe("?alt=sse");
    expect(captured[0]?.apiKey).toBe("gm-test-key");
    expect(captured[0]?.body).toMatchObject({
      contents: [
        { role: "user", parts: [{ text: "Hỏi" }] },
        { role: "model", parts: [{ text: "Đáp" }] },
        { role: "user", parts: [{ text: "Hỏi tiếp" }] },
      ],
      systemInstruction: { parts: [{ text: "Quy tắc" }] },
      generationConfig: { maxOutputTokens: 300 },
    });
  });

  test("ghép các chunk chữ, bỏ phần suy nghĩ và chunk rỗng", async () => {
    reply = {
      type: "stream",
      chunks: [
        {
          candidates: [
            {
              content: {
                role: "model",
                parts: [{ text: "đang nghĩ", thought: true }],
              },
              index: 0,
            },
          ],
        },
        textChunk("Mảng "),
        textChunk(""),
        textChunk("đã sắp xếp.", "STOP"),
      ],
    };
    expect(
      await collect(createProvider().stream(createProviderRequest())),
    ).toEqual([
      { type: "text", text: "Mảng " },
      { type: "text", text: "đã sắp xếp." },
      { type: "finish", finish: "complete" },
    ]);
  });

  test("MAX_TOKENS thành truncated, SAFETY thành blocked", async () => {
    reply = { type: "stream", chunks: [textChunk("Dài", "MAX_TOKENS")] };
    expect(
      (await collect(createProvider().stream(createProviderRequest()))).at(-1),
    ).toEqual({ type: "finish", finish: "truncated" });
    reply = { type: "stream", chunks: [textChunk("", "SAFETY")] };
    expect(
      await collect(createProvider().stream(createProviderRequest())),
    ).toEqual([{ type: "finish", finish: "blocked" }]);
  });

  test("prompt bị chặn qua promptFeedback thành blocked", async () => {
    reply = {
      type: "stream",
      chunks: [{ promptFeedback: { blockReason: "PROHIBITED_CONTENT" } }],
    };
    expect(
      await collect(createProvider().stream(createProviderRequest())),
    ).toEqual([{ type: "finish", finish: "blocked" }]);
  });

  const STATUS_CASES: readonly (readonly [number, ProviderFailure])[] = [
    [400, "bad-request"],
    [403, "auth"],
    [429, "rate-limited"],
    [500, "unavailable"],
  ];

  for (const [status, failure] of STATUS_CASES) {
    test(`HTTP ${status} thành lỗi ${failure}`, async () => {
      reply = { type: "error", status };
      const error = await collect(
        createProvider().stream(createProviderRequest()),
      ).catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(AssistantProviderError);
      if (error instanceof AssistantProviderError) {
        expect(error.provider).toBe("gemini");
        expect(error.failure).toBe(failure);
      }
    });
  }

  test("không gửi lại yêu cầu khi gặp lỗi, để phần chuyển mô hình lo", async () => {
    reply = { type: "error", status: 503 };
    await collect(createProvider().stream(createProviderRequest())).catch(
      () => undefined,
    );
    expect(captured).toHaveLength(1);
  });

  test("không kết nối được thì báo unavailable", async () => {
    const provider = createGeminiProvider({
      apiKey: "gm-test-key",
      model: "gemini-test",
      baseURL: "http://127.0.0.1:1",
    });
    const error = await collect(provider.stream(createProviderRequest())).catch(
      (caught: unknown) => caught,
    );
    expect(error).toMatchObject({ failure: "unavailable" });
  });

  test("huỷ giữa chừng thì báo aborted", async () => {
    reply = { type: "hang" };
    const controller = new AbortController();
    const iterator = createProvider()
      .stream(createProviderRequest({ signal: controller.signal }))
      [Symbol.asyncIterator]();
    expect(await iterator.next()).toEqual({
      done: false,
      value: { type: "text", text: "Đang " },
    });
    controller.abort();
    const error = await iterator.next().catch((caught: unknown) => caught);
    expect(error).toMatchObject({ failure: "aborted" });
  });
});
