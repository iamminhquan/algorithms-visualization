import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import {
  ASSISTANT_STREAM_CONTENT_TYPE,
  type AssistantErrorCode,
  createStreamEventParser,
  MAX_OUTPUT_TOKENS,
  MAX_REQUEST_BYTES,
  parseErrorBody,
} from "@/engine/assistant";
import {
  handleAssistantRequest,
  type IAssistantDependencies,
} from "@/features/assistant/handler";
import { attachContext, buildSystemPrompt } from "@/features/assistant/prompt";
import {
  BUBBLE_SORT_CONTEXT,
  BUBBLE_SORT_INFO,
  createAssistantHttpRequest,
  createFakeProvider,
  readStreamEvents,
} from "./helpers";

const VALID_BODY = {
  provider: "deepseek",
  messages: [
    { role: "assistant", content: "Chào bạn" },
    { role: "user", content: "Bubble Sort là gì?" },
  ],
};

let errorSpy: ReturnType<typeof spyOn>;

function handle(
  request: Request,
  dependencies: Pick<IAssistantDependencies, "providers"> &
    Partial<IAssistantDependencies>,
): Promise<Response> {
  return handleAssistantRequest(request, {
    lookupAlgorithm: async (key) =>
      key === BUBBLE_SORT_INFO.key ? BUBBLE_SORT_INFO : undefined,
    ...dependencies,
  });
}

beforeEach(() => {
  errorSpy = spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  errorSpy.mockRestore();
});

async function expectError(
  response: Response,
  status: number,
  code: AssistantErrorCode,
): Promise<void> {
  expect(response.status).toBe(status);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(parseErrorBody(await response.json())?.code).toBe(code);
}

describe("handleAssistantRequest: kiểm tra đầu vào", () => {
  test("JSON hỏng trả 400 invalid-request", async () => {
    const response = await handle(createAssistantHttpRequest("{hỏng"), {
      providers: [createFakeProvider("deepseek")],
    });
    await expectError(response, 400, "invalid-request");
  });

  test("sai cấu trúc trả 400 kèm thông báo từ bộ kiểm tra", async () => {
    const response = await handle(
      createAssistantHttpRequest({ provider: "gpt", messages: [] }),
      { providers: [createFakeProvider("deepseek")] },
    );
    expect(response.status).toBe(400);
    expect(parseErrorBody(await response.json())?.message).toBe(
      "Không nhận ra mô hình AI được chọn.",
    );
  });

  test("body vượt giới hạn trả 413 mà không gọi mô hình", async () => {
    const provider = createFakeProvider("deepseek");
    const response = await handle(
      createAssistantHttpRequest(
        JSON.stringify({ padding: "x".repeat(MAX_REQUEST_BYTES) }),
      ),
      { providers: [provider] },
    );
    await expectError(response, 413, "payload-too-large");
    expect(provider.requests).toHaveLength(0);
  });

  test("content-length khai báo quá lớn bị chặn trước khi đọc body", async () => {
    const response = await handle(
      createAssistantHttpRequest(VALID_BODY, {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": String(MAX_REQUEST_BYTES + 1),
        },
      }),
      { providers: [createFakeProvider("deepseek")] },
    );
    await expectError(response, 413, "payload-too-large");
  });

  test("tính giới hạn theo byte UTF-8 chứ không theo số ký tự", async () => {
    const provider = createFakeProvider("deepseek");
    const response = await handle(
      createAssistantHttpRequest(
        JSON.stringify({ padding: "ệ".repeat(MAX_REQUEST_BYTES / 2) }),
      ),
      { providers: [provider] },
    );
    await expectError(response, 413, "payload-too-large");
  });
});

describe("handleAssistantRequest: gọi mô hình", () => {
  test("chưa cấu hình mô hình nào trả 503 not-configured", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [],
    });
    await expectError(response, 503, "not-configured");
  });

  test("stream NDJSON gồm start, các đoạn chữ và done", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [createFakeProvider("deepseek")],
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      `${ASSISTANT_STREAM_CONTENT_TYPE}; charset=utf-8`,
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await readStreamEvents(response)).toEqual([
      { type: "start", provider: "deepseek" },
      { type: "text", text: "Xin " },
      { type: "text", text: "chào" },
      { type: "done", finish: "complete" },
    ]);
  });

  test("gửi system prompt, hội thoại đã chuẩn hoá và giới hạn token cho mô hình", async () => {
    const provider = createFakeProvider("deepseek");
    await (
      await handle(createAssistantHttpRequest(VALID_BODY), {
        providers: [provider],
      })
    ).text();
    expect(provider.requests).toHaveLength(1);
    const [request] = provider.requests;
    expect(request?.system).toBe(buildSystemPrompt());
    expect(request?.maxOutputTokens).toBe(MAX_OUTPUT_TOKENS);
    expect(request?.messages).toEqual([
      { role: "user", content: "Bubble Sort là gì?" },
    ]);
  });

  test("báo mô hình đã chuyển sang khi mô hình được chọn lỗi", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [
        createFakeProvider("deepseek", { failBefore: "unavailable" }),
        createFakeProvider("gemini"),
      ],
    });
    const events = await readStreamEvents(response);
    expect(events[0]).toEqual({
      type: "start",
      provider: "gemini",
      fallbackFrom: "deepseek",
    });
  });

  test("mọi mô hình bị giới hạn tần suất trả 503 với thông báo quá tải", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [
        createFakeProvider("deepseek", { failBefore: "rate-limited" }),
        createFakeProvider("gemini", { failBefore: "rate-limited" }),
      ],
    });
    expect(response.status).toBe(503);
    const error = parseErrorBody(await response.json());
    expect(error?.code).toBe("provider-unavailable");
    expect(error?.message).toContain("quá tải");
  });

  test("mọi mô hình lỗi vì lý do khác trả 502 và ghi log từng lỗi", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [
        createFakeProvider("deepseek", { failBefore: "auth" }),
        createFakeProvider("gemini", { failBefore: "rate-limited" }),
      ],
    });
    await expectError(response, 502, "provider-unavailable");
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  test("đứt giữa chừng thì gửi sự kiện error interrupted sau phần chữ đã có", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [createFakeProvider("deepseek", { failAfterChunks: 1 })],
    });
    const events = await readStreamEvents(response);
    expect(events.map((event) => event.type)).toEqual([
      "start",
      "text",
      "error",
    ]);
    expect(events.at(-1)).toMatchObject({ code: "interrupted" });
  });

  test("lý do kết thúc của mô hình được chuyển nguyên trong sự kiện done", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [
        createFakeProvider("deepseek", {
          chunks: [
            { type: "text", text: "Dài quá" },
            { type: "finish", finish: "truncated" },
          ],
        }),
      ],
    });
    expect((await readStreamEvents(response)).at(-1)).toEqual({
      type: "done",
      finish: "truncated",
    });
  });

  test("mô hình chặn nội dung ngay từ đầu vẫn trả 200 với done blocked", async () => {
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [
        createFakeProvider("deepseek", {
          chunks: [{ type: "finish", finish: "blocked" }],
        }),
      ],
    });
    expect(await readStreamEvents(response)).toEqual([
      { type: "start", provider: "deepseek" },
      { type: "done", finish: "blocked" },
    ]);
  });

  test("người dùng huỷ đọc stream thì tín hiệu huỷ tới được mô hình", async () => {
    const provider = createFakeProvider("deepseek", {
      waitForAbortAfterChunks: 1,
    });
    const response = await handle(createAssistantHttpRequest(VALID_BODY), {
      providers: [provider],
    });
    const reader = response.body?.getReader();
    if (reader === undefined) {
      throw new Error("Response không có body");
    }
    const parser = createStreamEventParser();
    const decoder = new TextDecoder();
    const first = await reader.read();
    expect(parser.push(decoder.decode(first.value))[0]?.type).toBe("start");
    await reader.cancel();
    expect(provider.requests[0]?.signal.aborted).toBe(true);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("request đã bị huỷ từ trước thì trả 499 và không thử mô hình khác", async () => {
    const controller = new AbortController();
    controller.abort();
    const gemini = createFakeProvider("gemini");
    const response = await handle(
      createAssistantHttpRequest(VALID_BODY, { signal: controller.signal }),
      {
        providers: [
          createFakeProvider("deepseek", { failBefore: "aborted" }),
          gemini,
        ],
      },
    );
    expect(response.status).toBe(499);
    expect(gemini.requests).toHaveLength(0);
  });
});

describe("handleAssistantRequest: ngữ cảnh bước đang xem", () => {
  const BODY_WITH_CONTEXT = { ...VALID_BODY, context: BUBBLE_SORT_CONTEXT };

  test("ghép thông tin thuật toán vào system prompt và ngữ cảnh vào câu hỏi cuối", async () => {
    const provider = createFakeProvider("deepseek");
    await (
      await handle(createAssistantHttpRequest(BODY_WITH_CONTEXT), {
        providers: [provider],
      })
    ).text();
    const [request] = provider.requests;
    expect(request?.system).toBe(buildSystemPrompt(BUBBLE_SORT_INFO));
    expect(request?.messages).toEqual(
      attachContext(
        [{ role: "user", content: "Bubble Sort là gì?" }],
        BUBBLE_SORT_CONTEXT,
      ),
    );
  });

  test("thuật toán không có trong danh mục thì trả 400 mà không gọi mô hình", async () => {
    const provider = createFakeProvider("deepseek");
    const response = await handle(
      createAssistantHttpRequest({
        ...BODY_WITH_CONTEXT,
        context: { ...BUBBLE_SORT_CONTEXT, algorithmKey: "quick-sort" },
      }),
      { providers: [provider] },
    );
    await expectError(response, 400, "invalid-request");
    expect(provider.requests).toHaveLength(0);
  });

  test("không đọc được DB thì vẫn trả lời, chỉ thiếu thông tin thuật toán", async () => {
    const provider = createFakeProvider("deepseek");
    const response = await handle(
      createAssistantHttpRequest(BODY_WITH_CONTEXT),
      {
        providers: [provider],
        lookupAlgorithm: () => Promise.reject(new Error("DB lỗi")),
      },
    );
    expect(response.status).toBe(200);
    await response.text();
    expect(provider.requests[0]?.system).toBe(buildSystemPrompt());
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test("không có ngữ cảnh thì không tra DB", async () => {
    let lookups = 0;
    await (
      await handle(createAssistantHttpRequest(VALID_BODY), {
        providers: [createFakeProvider("deepseek")],
        lookupAlgorithm: async () => {
          lookups += 1;
          return BUBBLE_SORT_INFO;
        },
      })
    ).text();
    expect(lookups).toBe(0);
  });
});
