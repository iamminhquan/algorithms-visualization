import { describe, expect, test } from "bun:test";
import {
  type AssistantStreamEvent,
  createErrorBody,
  createStreamEventParser,
  encodeStreamEvent,
  parseErrorBody,
  parseStreamEvent,
} from "@/engine/assistant";

const EVENTS: readonly AssistantStreamEvent[] = [
  { type: "start", provider: "gemini", fallbackFrom: "deepseek" },
  { type: "text", text: "Mảng có 3 phần tử.\nXong." },
  { type: "done", finish: "truncated" },
  { type: "error", code: "interrupted", message: "Bị gián đoạn" },
];

describe("encodeStreamEvent và parseStreamEvent", () => {
  test("mỗi sự kiện là một dòng JSON kết thúc bằng xuống dòng", () => {
    const encoded = encodeStreamEvent({ type: "text", text: "a\nb" });
    expect(encoded.endsWith("\n")).toBe(true);
    expect(encoded.slice(0, -1).includes("\n")).toBe(false);
  });

  test("giải mã lại đúng sự kiện đã mã hoá", () => {
    for (const event of EVENTS) {
      expect(parseStreamEvent(encodeStreamEvent(event).trim())).toEqual(event);
    }
  });

  test("bỏ qua dòng không phải JSON hoặc sai dạng", () => {
    expect(parseStreamEvent("không phải json")).toBeUndefined();
    expect(parseStreamEvent("[1,2]")).toBeUndefined();
    expect(parseStreamEvent('{"type":"text","text":1}')).toBeUndefined();
    expect(
      parseStreamEvent('{"type":"start","provider":"gpt"}'),
    ).toBeUndefined();
    expect(
      parseStreamEvent(
        '{"type":"start","provider":"gemini","fallbackFrom":"gpt"}',
      ),
    ).toBeUndefined();
    expect(parseStreamEvent('{"type":"done","finish":"ok"}')).toBeUndefined();
    expect(
      parseStreamEvent('{"type":"error","code":"boom","message":"x"}'),
    ).toBeUndefined();
    expect(parseStreamEvent('{"type":"unknown"}')).toBeUndefined();
  });
});

describe("createStreamEventParser", () => {
  test("ghép lại dòng bị cắt ở bất kỳ vị trí nào giữa các chunk", () => {
    const encoded = EVENTS.map(encodeStreamEvent).join("");
    for (let cut = 0; cut <= encoded.length; cut += 1) {
      const parser = createStreamEventParser();
      const events = [
        ...parser.push(encoded.slice(0, cut)),
        ...parser.push(encoded.slice(cut)),
        ...parser.flush(),
      ];
      expect(events).toEqual([...EVENTS]);
    }
  });

  test("flush trả về dòng cuối không có ký tự xuống dòng", () => {
    const parser = createStreamEventParser();
    expect(parser.push('{"type":"done","finish":"complete"}')).toEqual([]);
    expect(parser.flush()).toEqual([{ type: "done", finish: "complete" }]);
    expect(parser.flush()).toEqual([]);
  });

  test("bỏ qua dòng trống và dòng hỏng nhưng vẫn đọc tiếp", () => {
    const parser = createStreamEventParser();
    const events = parser.push('\n\n{hỏng}\n{"type":"text","text":"ok"}\r\n');
    expect(events).toEqual([{ type: "text", text: "ok" }]);
  });
});

describe("createErrorBody và parseErrorBody", () => {
  test("đọc lại đúng lỗi đã tạo", () => {
    const error = { code: "rate-limited", message: "Chậm lại" } as const;
    expect(parseErrorBody(createErrorBody(error))).toEqual(error);
  });

  test("trả về undefined khi body không đúng dạng", () => {
    expect(parseErrorBody(undefined)).toBeUndefined();
    expect(parseErrorBody({ error: "x" })).toBeUndefined();
    expect(
      parseErrorBody({ error: { code: "lạ", message: "x" } }),
    ).toBeUndefined();
  });
});
