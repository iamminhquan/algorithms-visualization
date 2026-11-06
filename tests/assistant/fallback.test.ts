import { describe, expect, test } from "bun:test";
import {
  AllProvidersFailedError,
  NoProviderConfiguredError,
  openProviderStream,
  orderProviders,
} from "@/features/assistant/fallback";
import {
  AssistantProviderError,
  type IAssistantProvider,
  type ProviderChunk,
} from "@/features/assistant/providers/types";
import {
  createFakeProvider,
  createProviderRequest,
  DEFAULT_CHUNKS,
} from "./helpers";

async function drain(
  first: ProviderChunk,
  rest: AsyncIterator<ProviderChunk>,
): Promise<ProviderChunk[]> {
  const chunks = [first];
  for (let next = await rest.next(); !next.done; next = await rest.next()) {
    chunks.push(next.value);
  }
  return chunks;
}

describe("orderProviders", () => {
  test("xếp mô hình theo thứ tự ưu tiên DeepSeek rồi Gemini", () => {
    const providers = [
      createFakeProvider("gemini"),
      createFakeProvider("deepseek"),
    ];
    expect(orderProviders(providers).map((p) => p.id)).toEqual([
      "deepseek",
      "gemini",
    ]);
    expect(orderProviders([...providers].reverse()).map((p) => p.id)).toEqual([
      "deepseek",
      "gemini",
    ]);
  });

  test("giữ nguyên khi chỉ có một mô hình", () => {
    const providers = [createFakeProvider("gemini")];
    expect(orderProviders(providers).map((p) => p.id)).toEqual(["gemini"]);
  });
});

describe("openProviderStream", () => {
  test("không có mô hình nào thì ném NoProviderConfiguredError", async () => {
    await expect(
      openProviderStream([], createProviderRequest()),
    ).rejects.toBeInstanceOf(NoProviderConfiguredError);
  });

  test("dùng mô hình ưu tiên khi nó chạy được", async () => {
    const deepseek = createFakeProvider("deepseek");
    const gemini = createFakeProvider("gemini");
    const opened = await openProviderStream(
      [gemini, deepseek],
      createProviderRequest(),
    );
    expect(opened.provider).toBe("deepseek");
    expect(opened.fallbackFrom).toBeUndefined();
    expect(await drain(opened.first, opened.rest)).toEqual([...DEFAULT_CHUNKS]);
    expect(gemini.requests).toHaveLength(0);
  });

  test("chuyển sang mô hình kế tiếp khi mô hình ưu tiên lỗi trước khi trả chữ", async () => {
    const deepseek = createFakeProvider("deepseek", {
      failBefore: "rate-limited",
    });
    const gemini = createFakeProvider("gemini");
    const request = createProviderRequest();
    const opened = await openProviderStream([gemini, deepseek], request);
    expect(opened.provider).toBe("gemini");
    expect(opened.fallbackFrom).toBe("deepseek");
    expect(gemini.requests).toEqual([request]);
  });

  test("mô hình ưu tiên chưa cấu hình thì dùng mô hình còn lại", async () => {
    const opened = await openProviderStream(
      [createFakeProvider("gemini")],
      createProviderRequest(),
    );
    expect(opened.provider).toBe("gemini");
    expect(opened.fallbackFrom).toBeUndefined();
  });

  test("mô hình không trả về gì thì coi như lỗi và chuyển tiếp", async () => {
    const opened = await openProviderStream(
      [
        createFakeProvider("gemini"),
        createFakeProvider("deepseek", { chunks: [] }),
      ],
      createProviderRequest(),
    );
    expect(opened.provider).toBe("gemini");
    expect(opened.fallbackFrom).toBe("deepseek");
  });

  test("mọi mô hình lỗi thì ném AllProvidersFailedError kèm từng lỗi", async () => {
    const error = await openProviderStream(
      [
        createFakeProvider("deepseek", { failBefore: "auth" }),
        createFakeProvider("gemini", { failBefore: "unavailable" }),
      ],
      createProviderRequest(),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AllProvidersFailedError);
    if (!(error instanceof AllProvidersFailedError)) {
      return;
    }
    expect(
      error.failures.map((failure) => [failure.provider, failure.failure]),
    ).toEqual([
      ["deepseek", "auth"],
      ["gemini", "unavailable"],
    ]);
  });

  test("bị huỷ thì dừng ngay, không thử mô hình khác", async () => {
    const gemini = createFakeProvider("gemini");
    const error = await openProviderStream(
      [createFakeProvider("deepseek", { failBefore: "aborted" }), gemini],
      createProviderRequest(),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AssistantProviderError);
    expect(gemini.requests).toHaveLength(0);
  });

  test("lỗi lạ không phải AssistantProviderError vẫn được bọc lại", async () => {
    const broken: IAssistantProvider = {
      id: "deepseek",
      stream: () => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.reject(new TypeError("hỏng")),
        }),
      }),
    };
    const error = await openProviderStream(
      [broken],
      createProviderRequest(),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AllProvidersFailedError);
    if (error instanceof AllProvidersFailedError) {
      expect(error.failures[0]?.failure).toBe("unavailable");
      expect(error.failures[0]?.cause).toBeInstanceOf(TypeError);
    }
  });
});
