import { describe, expect, test } from "bun:test";
import { readAssistantConfig } from "@/features/assistant/config";
import { createAssistantProviders } from "@/features/assistant/providers";
import { DEEPSEEK_DEFAULT_MODEL } from "@/features/assistant/providers/deepseek";
import { GEMINI_DEFAULT_MODEL } from "@/features/assistant/providers/gemini";

describe("readAssistantConfig", () => {
  test("không có API key thì không cấu hình mô hình nào", () => {
    expect(readAssistantConfig({})).toEqual({
      deepseek: undefined,
      gemini: undefined,
      redisUrl: undefined,
    });
  });

  test("API key rỗng hoặc toàn khoảng trắng coi như chưa đặt", () => {
    expect(
      readAssistantConfig({ DEEPSEEK_API_KEY: "  ", GEMINI_API_KEY: "" }),
    ).toEqual({ deepseek: undefined, gemini: undefined, redisUrl: undefined });
  });

  test("dùng model mặc định khi chỉ có API key", () => {
    expect(
      readAssistantConfig({ DEEPSEEK_API_KEY: "ds", GEMINI_API_KEY: "gm" }),
    ).toEqual({
      deepseek: {
        apiKey: "ds",
        model: DEEPSEEK_DEFAULT_MODEL,
        baseURL: undefined,
      },
      gemini: { apiKey: "gm", model: GEMINI_DEFAULT_MODEL, baseURL: undefined },
      redisUrl: undefined,
    });
  });

  test("đọc REDIS_URL để đếm lượt hỏi bằng Redis", () => {
    expect(
      readAssistantConfig({ REDIS_URL: " redis://:pw@localhost:6379 " })
        .redisUrl,
    ).toBe("redis://:pw@localhost:6379");
  });

  test("đọc model và base URL tuỳ chỉnh, cắt khoảng trắng", () => {
    expect(
      readAssistantConfig({
        GEMINI_API_KEY: " gm ",
        GEMINI_MODEL: " gemini-x ",
        GEMINI_BASE_URL: "http://localhost:9000",
      }).gemini,
    ).toEqual({
      apiKey: "gm",
      model: "gemini-x",
      baseURL: "http://localhost:9000",
    });
  });
});

describe("createAssistantProviders", () => {
  test("chỉ tạo mô hình đã có API key, theo thứ tự DeepSeek rồi Gemini", () => {
    expect(createAssistantProviders({}).map((p) => p.id)).toEqual([]);
    expect(
      createAssistantProviders(
        readAssistantConfig({ GEMINI_API_KEY: "gm" }),
      ).map((p) => p.id),
    ).toEqual(["gemini"]);
    expect(
      createAssistantProviders(
        readAssistantConfig({ DEEPSEEK_API_KEY: "ds", GEMINI_API_KEY: "gm" }),
      ).map((p) => p.id),
    ).toEqual(["deepseek", "gemini"]);
  });
});
