import type { AssistantProviderId } from "@/engine/assistant";
import { QUESTION_TAG } from "@/features/assistant/prompt";

const PORT = Number(process.env.MOCK_ASSISTANT_PORT ?? 4010);
const WORD_DELAY_MS = Number(process.env.MOCK_ASSISTANT_DELAY_MS ?? 40);
const FAILING_PROVIDER = process.env.MOCK_ASSISTANT_FAIL;
const ANTHROPIC_MESSAGES_PATH = "/anthropic/v1/messages";
const GEMINI_STREAM_SUFFIX = ":streamGenerateContent";
const QUESTION_PATTERN = new RegExp(
  `<${QUESTION_TAG}>\\n([\\s\\S]*?)\\n</${QUESTION_TAG}>`,
);
const WORD_PATTERN = /\S+\s*/g;

const encoder = new TextEncoder();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function lastText(items: unknown, read: (item: unknown) => string): string {
  return Array.isArray(items) && items.length > 0 ? read(items.at(-1)) : "";
}

function readAnthropicQuestion(body: unknown): string {
  return isRecord(body)
    ? lastText(body.messages, (item) =>
        isRecord(item) && typeof item.content === "string" ? item.content : "",
      )
    : "";
}

function readGeminiQuestion(body: unknown): string {
  return isRecord(body)
    ? lastText(body.contents, (item) =>
        isRecord(item) && Array.isArray(item.parts)
          ? item.parts
              .map((part: unknown) =>
                isRecord(part) && typeof part.text === "string"
                  ? part.text
                  : "",
              )
              .join("")
          : "",
      )
    : "";
}

function createAnswer(
  provider: AssistantProviderId,
  rawQuestion: string,
): string[] {
  const question = rawQuestion.match(QUESTION_PATTERN)?.[1] ?? rawQuestion;
  const hasContext = question !== rawQuestion;
  const text = [
    `Đây là câu trả lời **giả lập** từ ${provider} cho câu hỏi: "${question.slice(0, 120)}".`,
    "",
    hasContext
      ? "- Máy chủ đã gửi kèm ngữ cảnh của bước đang xem."
      : "- Câu hỏi này không có ngữ cảnh bước.",
    "- Đặt API key thật trong `.env.local` để nhận câu trả lời thật.",
  ].join("\n");
  return text.match(WORD_PATTERN) ?? [text];
}

function anthropicEvent(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function geminiChunk(text: string, finishReason?: string): Uint8Array {
  const candidate = {
    content: { role: "model", parts: [{ text }] },
    index: 0,
    ...(finishReason === undefined ? {} : { finishReason }),
  };
  return encoder.encode(
    `data: ${JSON.stringify({ candidates: [candidate] })}\r\n\r\n`,
  );
}

function streamResponse(
  signal: AbortSignal,
  produce: (send: (chunk: Uint8Array) => void) => Promise<void>,
): Response {
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      await produce((chunk) => {
        if (!signal.aborted) {
          controller.enqueue(chunk);
        }
      });
      if (!signal.aborted) {
        controller.close();
      }
    },
  });
  return new Response(body, {
    headers: { "content-type": "text/event-stream" },
  });
}

function anthropicStream(
  words: readonly string[],
  signal: AbortSignal,
): Response {
  return streamResponse(signal, async (send) => {
    send(
      anthropicEvent("message_start", {
        type: "message_start",
        message: {
          id: "msg_mock",
          type: "message",
          role: "assistant",
          model: "mock",
          content: [],
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 0, output_tokens: 0 },
        },
      }),
    );
    send(
      anthropicEvent("content_block_start", {
        type: "content_block_start",
        index: 0,
        content_block: { type: "text", text: "" },
      }),
    );
    for (const word of words) {
      await Bun.sleep(WORD_DELAY_MS);
      send(
        anthropicEvent("content_block_delta", {
          type: "content_block_delta",
          index: 0,
          delta: { type: "text_delta", text: word },
        }),
      );
    }
    send(
      anthropicEvent("content_block_stop", {
        type: "content_block_stop",
        index: 0,
      }),
    );
    send(
      anthropicEvent("message_delta", {
        type: "message_delta",
        delta: { stop_reason: "end_turn", stop_sequence: null },
        usage: { output_tokens: words.length },
      }),
    );
    send(anthropicEvent("message_stop", { type: "message_stop" }));
  });
}

function geminiStream(words: readonly string[], signal: AbortSignal): Response {
  return streamResponse(signal, async (send) => {
    for (const [index, word] of words.entries()) {
      await Bun.sleep(WORD_DELAY_MS);
      send(geminiChunk(word, index === words.length - 1 ? "STOP" : undefined));
    }
  });
}

function unavailable(): Response {
  return Response.json(
    { error: { message: "Mô hình giả lập đang được tắt" } },
    { status: 503, headers: { "x-should-retry": "false" } },
  );
}

const server = Bun.serve({
  port: PORT,
  idleTimeout: 120,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const body: unknown = await request.json().catch(() => undefined);
    if (pathname === ANTHROPIC_MESSAGES_PATH) {
      return FAILING_PROVIDER === "deepseek"
        ? unavailable()
        : anthropicStream(
            createAnswer("deepseek", readAnthropicQuestion(body)),
            request.signal,
          );
    }
    if (pathname.endsWith(GEMINI_STREAM_SUFFIX)) {
      return FAILING_PROVIDER === "gemini"
        ? unavailable()
        : geminiStream(
            createAnswer("gemini", readGeminiQuestion(body)),
            request.signal,
          );
    }
    return new Response("Không có endpoint này", { status: 404 });
  },
});

console.log(`Mô hình giả lập chạy ở ${server.url}`);
