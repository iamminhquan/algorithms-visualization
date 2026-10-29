import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { createDeepSeekProvider } from "@/features/assistant/providers/deepseek";
import {
  AssistantProviderError,
  type ProviderFailure,
} from "@/features/assistant/providers/types";
import { collect, createProviderRequest } from "./helpers";

interface ICapturedRequest {
  readonly path: string;
  readonly apiKey: string | null;
  readonly authorization: string | null;
  readonly body: unknown;
}

type MockReply =
  | {
      readonly type: "stream";
      readonly texts: readonly string[];
      readonly stopReason: string;
    }
  | { readonly type: "error"; readonly status: number }
  | { readonly type: "hang" };

const captured: ICapturedRequest[] = [];
let reply: MockReply = { type: "stream", texts: [], stopReason: "end_turn" };
let server: ReturnType<typeof Bun.serve>;

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function anthropicStream(texts: readonly string[], stopReason: string): string {
  return [
    sse("message_start", {
      type: "message_start",
      message: {
        id: "msg_test",
        type: "message",
        role: "assistant",
        model: "deepseek-test",
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 12, output_tokens: 0 },
      },
    }),
    sse("content_block_start", {
      type: "content_block_start",
      index: 0,
      content_block: { type: "text", text: "" },
    }),
    ...texts.map((text) =>
      sse("content_block_delta", {
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text },
      }),
    ),
    sse("content_block_stop", { type: "content_block_stop", index: 0 }),
    sse("message_delta", {
      type: "message_delta",
      delta: { stop_reason: stopReason, stop_sequence: null },
      usage: { output_tokens: texts.length },
    }),
    sse("message_stop", { type: "message_stop" }),
  ].join("");
}

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    async fetch(request) {
      captured.push({
        path: new URL(request.url).pathname,
        apiKey: request.headers.get("x-api-key"),
        authorization: request.headers.get("authorization"),
        body: await request.json(),
      });
      if (reply.type === "error") {
        return Response.json(
          { type: "error", error: { type: "api_error", message: "lỗi giả" } },
          { status: reply.status, headers: { "x-should-retry": "false" } },
        );
      }
      if (reply.type === "hang") {
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(
                  anthropicStream(["Đang "], "end_turn").split(
                    "event: content_block_stop",
                  )[0],
                ),
              );
            },
          }),
          { headers: { "content-type": "text/event-stream" } },
        );
      }
      return new Response(anthropicStream(reply.texts, reply.stopReason), {
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
  return createDeepSeekProvider({
    apiKey: "ds-test-key",
    model: "deepseek-test",
    baseURL: new URL("/anthropic", server.url).toString(),
  });
}

describe("createDeepSeekProvider qua Anthropic SDK", () => {
  test("gọi đúng endpoint Anthropic của DeepSeek với API key và nội dung yêu cầu", async () => {
    reply = { type: "stream", texts: ["Xin ", "chào"], stopReason: "end_turn" };
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
    expect(captured[0]?.path).toBe("/anthropic/v1/messages");
    expect(captured[0]?.apiKey).toBe("ds-test-key");
    expect(captured[0]?.authorization).toBe("Bearer ds-test-key");
    expect(captured[0]?.body).toMatchObject({
      model: "deepseek-test",
      max_tokens: 300,
      system: "Quy tắc",
      stream: true,
      messages: [
        { role: "user", content: "Hỏi" },
        { role: "assistant", content: "Đáp" },
        { role: "user", content: "Hỏi tiếp" },
      ],
    });
  });

  test("chuyển text_delta thành các đoạn chữ và kết thúc bằng complete", async () => {
    reply = {
      type: "stream",
      texts: ["Mảng ", "đã ", "sắp xếp."],
      stopReason: "end_turn",
    };
    expect(
      await collect(createProvider().stream(createProviderRequest())),
    ).toEqual([
      { type: "text", text: "Mảng " },
      { type: "text", text: "đã " },
      { type: "text", text: "sắp xếp." },
      { type: "finish", finish: "complete" },
    ]);
  });

  test("stop_reason max_tokens thành truncated, refusal thành blocked", async () => {
    reply = { type: "stream", texts: ["Dài"], stopReason: "max_tokens" };
    expect(
      (await collect(createProvider().stream(createProviderRequest()))).at(-1),
    ).toEqual({ type: "finish", finish: "truncated" });
    reply = { type: "stream", texts: [], stopReason: "refusal" };
    expect(
      await collect(createProvider().stream(createProviderRequest())),
    ).toEqual([{ type: "finish", finish: "blocked" }]);
  });

  const STATUS_CASES: readonly (readonly [number, ProviderFailure])[] = [
    [400, "bad-request"],
    [401, "auth"],
    [402, "billing"],
    [403, "auth"],
    [429, "rate-limited"],
    [500, "unavailable"],
    [503, "unavailable"],
  ];

  for (const [status, failure] of STATUS_CASES) {
    test(`HTTP ${status} thành lỗi ${failure}`, async () => {
      reply = { type: "error", status };
      const error = await collect(
        createProvider().stream(createProviderRequest()),
      ).catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(AssistantProviderError);
      if (error instanceof AssistantProviderError) {
        expect(error.provider).toBe("deepseek");
        expect(error.failure).toBe(failure);
      }
    });
  }

  test("không kết nối được thì báo unavailable", async () => {
    const provider = createDeepSeekProvider({
      apiKey: "ds-test-key",
      model: "deepseek-test",
      baseURL: "http://127.0.0.1:1/anthropic",
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
