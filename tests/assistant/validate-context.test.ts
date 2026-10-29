import { describe, expect, test } from "bun:test";
import {
  MAX_CONTEXT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_METRICS,
  MAX_PSEUDOCODE_LINES,
} from "@/engine/assistant";
import { parseAssistantRequest } from "@/features/assistant/validate";
import { parseAssistantContext } from "@/features/assistant/validate-context";
import { BUBBLE_SORT_CONTEXT } from "./helpers";

function withChanges(changes: Record<string, unknown>): unknown {
  return { ...structuredClone(BUBBLE_SORT_CONTEXT), ...changes };
}

function withStep(changes: Record<string, unknown>): unknown {
  return withChanges({
    step: { ...structuredClone(BUBBLE_SORT_CONTEXT.step), ...changes },
  });
}

function messageOf(value: unknown): string | undefined {
  const result = parseAssistantContext(value);
  return result.type === "invalid" ? result.message : undefined;
}

describe("parseAssistantContext", () => {
  test("chấp nhận ngữ cảnh hợp lệ và giữ nguyên dữ liệu", () => {
    expect(parseAssistantContext(structuredClone(BUBBLE_SORT_CONTEXT))).toEqual(
      { type: "valid", context: BUBBLE_SORT_CONTEXT },
    );
  });

  test("bỏ các trường lạ ở cấp ngữ cảnh và chỉ số", () => {
    const result = parseAssistantContext(
      withChanges({
        secret: "x",
        metrics: [{ label: "So sánh", value: 1, extra: true }],
      }),
    );
    expect(result.type).toBe("valid");
    if (result.type === "valid") {
      expect(result.context).not.toHaveProperty("secret");
      expect(result.context.metrics).toEqual([{ label: "So sánh", value: 1 }]);
    }
  });

  test("dòng mã giả đang chạy có thể vắng mặt", () => {
    const { activeLine: _, ...rest } = BUBBLE_SORT_CONTEXT;
    expect(parseAssistantContext(rest).type).toBe("valid");
  });

  test("từ chối ngữ cảnh không phải object hoặc quá lớn", () => {
    expect(messageOf("x")).toBe("Ngữ cảnh mô phỏng không đúng định dạng.");
    expect(messageOf([])).toBe("Ngữ cảnh mô phỏng không đúng định dạng.");
    expect(
      messageOf(withChanges({ input: "x".repeat(MAX_CONTEXT_LENGTH) })),
    ).toBe("Ngữ cảnh mô phỏng quá lớn.");
  });

  test("key thuật toán phải đúng dạng slug", () => {
    for (const algorithmKey of [
      "",
      "Bubble",
      "a_b",
      "../x",
      1,
      "a".repeat(65),
    ]) {
      expect(messageOf(withChanges({ algorithmKey }))).toBe(
        "Mã thuật toán trong ngữ cảnh không hợp lệ.",
      );
    }
  });

  test("số thứ tự bước phải là số nguyên không âm và nhỏ hơn tổng số bước", () => {
    for (const step of [
      { index: -1 },
      { index: 1.5 },
      { index: 9 },
      { total: 0, index: 0 },
      { index: "1" },
    ]) {
      expect(messageOf(withStep(step))).toBe(
        "Thông tin bước trong ngữ cảnh không hợp lệ.",
      );
    }
    expect(messageOf(withChanges({ step: "x" }))).toBe(
      "Thông tin bước trong ngữ cảnh không hợp lệ.",
    );
  });

  test("mô tả bước và thao tác phải đúng kiểu, không quá dài", () => {
    expect(
      messageOf(
        withStep({ description: "x".repeat(MAX_DESCRIPTION_LENGTH + 1) }),
      ),
    ).toBe("Mô tả bước không phải chữ hoặc quá dài.");
    expect(messageOf(withStep({ payload: { indices: [0] } }))).toBe(
      "Thao tác của bước không hợp lệ.",
    );
    expect(messageOf(withStep({ payload: "compare" }))).toBe(
      "Thao tác của bước không hợp lệ.",
    );
  });

  test("mã giả và dòng đang chạy phải khớp nhau", () => {
    expect(messageOf(withChanges({ pseudocode: "x" }))).toBe(
      "Mã giả trong ngữ cảnh không hợp lệ.",
    );
    expect(messageOf(withChanges({ pseudocode: [1] }))).toBe(
      "Mã giả trong ngữ cảnh không hợp lệ.",
    );
    expect(
      messageOf(
        withChanges({
          pseudocode: Array.from(
            { length: MAX_PSEUDOCODE_LINES + 1 },
            () => "x",
          ),
        }),
      ),
    ).toBe("Mã giả trong ngữ cảnh không hợp lệ.");
    expect(messageOf(withChanges({ activeLine: 3 }))).toBe(
      "Dòng mã giả đang chạy không hợp lệ.",
    );
    expect(messageOf(withChanges({ activeLine: null }))).toBe(
      "Dòng mã giả đang chạy không hợp lệ.",
    );
  });

  test("chỉ số phải có nhãn ngắn và giá trị là số hữu hạn hoặc chữ ngắn", () => {
    for (const metrics of [
      "x",
      [{ label: 1, value: 1 }],
      [{ label: "a", value: null }],
      [{ label: "a", value: "x".repeat(41) }],
      Array.from({ length: MAX_METRICS + 1 }, () => ({ label: "a", value: 1 })),
    ]) {
      expect(messageOf(withChanges({ metrics }))).toBe(
        "Chỉ số trong ngữ cảnh không hợp lệ.",
      );
    }
  });
});

describe("parseAssistantRequest với ngữ cảnh", () => {
  const messages = [{ role: "user", content: "Giải thích bước này" }] as const;

  test("ngữ cảnh hợp lệ được giữ trong yêu cầu", () => {
    const result = parseAssistantRequest({
      provider: "deepseek",
      messages,
      context: structuredClone(BUBBLE_SORT_CONTEXT),
    });
    expect(result).toEqual({
      type: "valid",
      request: {
        provider: "deepseek",
        messages,
        context: BUBBLE_SORT_CONTEXT,
      },
    });
  });

  test("ngữ cảnh sai làm cả yêu cầu bị từ chối", () => {
    const result = parseAssistantRequest({
      provider: "deepseek",
      messages,
      context: { algorithmKey: "bubble-sort" },
    });
    expect(result.type).toBe("invalid");
  });
});
