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
  test("đưa mô hình được chọn lên đầu, giữ thứ tự phần còn lại", () => {
    const providers = [
      createFakeProvider("deepseek"),
      createFakeProvider("gemini"),
    ];
    expect(orderProviders(providers, "gemini").map((p) => p.id)).toEqual([
      "gemini",
      "deepseek",
    ]);
    expect(orderProviders(providers, "deepseek").map((p) => p.id)).toEqual([
      "deepseek",
      "gemini",
    ]);
  });

  test("mô hình được chọn chưa cấu hình thì giữ nguyên danh sách", () => {
    const providers = [createFakeProvider("deepseek")];
    expect(orderProviders(providers, "gemini").map((p) => p.id)).toEqual([
      "deepseek",
    ]);
  });
});

describe("openProviderStream", () => {
  test("không có mô hình nào thì ném NoProviderConfiguredError", async () => {
    await expect(
      openProviderStream([], "deepseek", createProviderRequest()),
    ).rejects.toBeInstanceOf(NoProviderConfiguredError);
  });

  test("dùng mô hình được chọn khi nó chạy được", async () => {
    const deepseek = createFakeProvider("deepseek");
    const gemini = createFakeProvider("gemini");
    const opened = await openProviderStream(
      [deepseek, gemini],
      "deepseek",
      createProviderRequest(),
    );
    expect(opened.provider).toBe("deepseek");
    expect(opened.fallbackFrom).toBeUndefined();
    expect(await drain(opened.first, opened.rest)).toEqual([...DEFAULT_CHUNKS]);
    expect(gemini.requests).toHaveLength(0);
  });

  test("chuyển sang mô hình còn lại khi mô hình được chọn lỗi trước khi trả chữ", async () => {
    const deepseek = createFakeProvider("deepseek", {
      failBefore: "rate-limited",
    });
    const gemini = createFakeProvider("gemini");
    const request = createProviderRequest();
    const opened = await openProviderStream(
      [deepseek, gemini],
      "deepseek",
      request,
    );
    expect(opened.provider).toBe("gemini");
    expect(opened.fallbackFrom).toBe("deepseek");
    expect(gemini.requests).toEqual([request]);
  });

  test("mô hình được chọn chưa cấu hình thì báo là đã chuyển", async () => {
    const opened = await openProviderStream(
      [createFakeProvider("deepseek")],
      "gemini",
      createProviderRequest(),
    );
    expect(opened.provider).toBe("deepseek");
    expect(opened.fallbackFrom).toBe("gemini");
  });

  test("mô hình không trả về gì thì coi như lỗi và chuyển tiếp", async () => {
    const opened = await openProviderStream(
      [
        createFakeProvider("deepseek", { chunks: [] }),
        createFakeProvider("gemini"),
      ],
      "deepseek",
      createProviderRequest(),
    );
    expect(opened.provider).toBe("gemini");
  });

  test("mọi mô hình lỗi thì ném AllProvidersFailedError kèm từng lỗi", async () => {
    const error = await openProviderStream(
      [
        createFakeProvider("deepseek", { failBefore: "auth" }),
        createFakeProvider("gemini", { failBefore: "unavailable" }),
      ],
      "gemini",
      createProviderRequest(),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AllProvidersFailedError);
    if (!(error instanceof AllProvidersFailedError)) {
      return;
    }
    expect(
      error.failures.map((failure) => [failure.provider, failure.failure]),
    ).toEqual([
      ["gemini", "unavailable"],
      ["deepseek", "auth"],
    ]);
  });

  test("bị huỷ thì dừng ngay, không thử mô hình khác", async () => {
    const gemini = createFakeProvider("gemini");
    const error = await openProviderStream(
      [createFakeProvider("deepseek", { failBefore: "aborted" }), gemini],
      "deepseek",
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
      "deepseek",
      createProviderRequest(),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AllProvidersFailedError);
    if (error instanceof AllProvidersFailedError) {
      expect(error.failures[0]?.failure).toBe("unavailable");
      expect(error.failures[0]?.cause).toBeInstanceOf(TypeError);
    }
  });
});
