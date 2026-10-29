import { type AssistantProviderId, isAssistantProviderId } from "./types";

export const ASSISTANT_FINISH_REASONS = [
  "complete",
  "truncated",
  "blocked",
] as const;

export type AssistantFinishReason = (typeof ASSISTANT_FINISH_REASONS)[number];

export const ASSISTANT_ERROR_CODES = [
  "invalid-request",
  "payload-too-large",
  "rate-limited",
  "not-configured",
  "provider-unavailable",
  "interrupted",
] as const;

export type AssistantErrorCode = (typeof ASSISTANT_ERROR_CODES)[number];

export interface IAssistantError {
  readonly code: AssistantErrorCode;
  readonly message: string;
}

export type AssistantStreamEvent =
  | {
      readonly type: "start";
      readonly provider: AssistantProviderId;
      readonly fallbackFrom?: AssistantProviderId;
    }
  | { readonly type: "text"; readonly text: string }
  | { readonly type: "done"; readonly finish: AssistantFinishReason }
  | ({ readonly type: "error" } & IAssistantError);

export interface IStreamEventParser {
  readonly push: (chunk: string) => readonly AssistantStreamEvent[];
  readonly flush: () => readonly AssistantStreamEvent[];
}

export const ASSISTANT_STREAM_CONTENT_TYPE = "application/x-ndjson";

const LINE_SEPARATOR = "\n";

/*
 * Kiểm tra bản ghi này có đúng định dạng NDJSON hay không?
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFinishReason(value: unknown): value is AssistantFinishReason {
  return ASSISTANT_FINISH_REASONS.some((reason) => reason === value);
}

function isErrorCode(value: unknown): value is AssistantErrorCode {
  return ASSISTANT_ERROR_CODES.some((code) => code === value);
}

function toAssistantError(value: unknown): IAssistantError | undefined {
  if (
    !isRecord(value) ||
    !isErrorCode(value.code) ||
    typeof value.message !== "string"
  ) {
    return undefined;
  }
  return { code: value.code, message: value.message };
}

/*
 * Mã hóa từng event thành định dạng NDJSON.
 */
export function encodeStreamEvent(event: AssistantStreamEvent): string {
  return `${JSON.stringify(event)}${LINE_SEPARATOR}`;
}

export function parseStreamEvent(
  line: string,
): AssistantStreamEvent | undefined {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    return undefined;
  }
  if (!isRecord(value)) {
    return undefined;
  }
  switch (value.type) {
    case "start": {
      if (!isAssistantProviderId(value.provider)) {
        return undefined;
      }
      if (value.fallbackFrom === undefined) {
        return { type: "start", provider: value.provider };
      }
      return isAssistantProviderId(value.fallbackFrom)
        ? {
            type: "start",
            provider: value.provider,
            fallbackFrom: value.fallbackFrom,
          }
        : undefined;
    }
    case "text":
      return typeof value.text === "string"
        ? { type: "text", text: value.text }
        : undefined;
    case "done":
      return isFinishReason(value.finish)
        ? { type: "done", finish: value.finish }
        : undefined;
    case "error": {
      const error = toAssistantError(value);
      return error === undefined ? undefined : { type: "error", ...error };
    }
    default:
      return undefined;
  }
}

function parseLines(lines: readonly string[]): AssistantStreamEvent[] {
  const events: AssistantStreamEvent[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      continue;
    }
    const event = parseStreamEvent(trimmed);
    if (event !== undefined) {
      events.push(event);
    }
  }
  return events;
}

export function createStreamEventParser(): IStreamEventParser {
  let pending = "";
  return {
    push: (chunk) => {
      const lines = `${pending}${chunk}`.split(LINE_SEPARATOR);
      pending = lines.pop() ?? "";
      return parseLines(lines);
    },
    flush: () => {
      const rest = pending;
      pending = "";
      return parseLines([rest]);
    },
  };
}

export function createErrorBody(error: IAssistantError): {
  readonly error: IAssistantError;
} {
  return { error };
}

export function parseErrorBody(value: unknown): IAssistantError | undefined {
  return isRecord(value) ? toAssistantError(value.error) : undefined;
}
