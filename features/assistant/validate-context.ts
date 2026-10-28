import {
  type IAssistantContext,
  type IAssistantMetric,
  MAX_ALGORITHM_KEY_LENGTH,
  MAX_CONTEXT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_METRIC_TEXT_LENGTH,
  MAX_METRICS,
  MAX_PAYLOAD_TYPE_LENGTH,
  MAX_PSEUDOCODE_LINE_LENGTH,
  MAX_PSEUDOCODE_LINES,
} from "@/engine/assistant";
import { isNonNegativeInteger, isRecord, isShortText } from "./guards";

export type AssistantContextParseResult =
  | { readonly type: "valid"; readonly context: IAssistantContext }
  | { readonly type: "invalid"; readonly message: string };

const ALGORITHM_KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function invalid(message: string): AssistantContextParseResult {
  return { type: "invalid", message };
}

function isMetric(value: unknown): value is IAssistantMetric {
  if (!isRecord(value) || !isShortText(value.label, MAX_METRIC_TEXT_LENGTH)) {
    return false;
  }
  return (
    (typeof value.value === "number" && Number.isFinite(value.value)) ||
    isShortText(value.value, MAX_METRIC_TEXT_LENGTH)
  );
}

function isPseudocodeLine(value: unknown): value is string {
  return isShortText(value, MAX_PSEUDOCODE_LINE_LENGTH);
}

export function parseAssistantContext(
  value: unknown,
): AssistantContextParseResult {
  if (!isRecord(value)) {
    return invalid("Ngữ cảnh mô phỏng không đúng định dạng.");
  }
  if (JSON.stringify(value).length > MAX_CONTEXT_LENGTH) {
    return invalid("Ngữ cảnh mô phỏng quá lớn.");
  }

  const { algorithmKey, input, step, pseudocode, activeLine, metrics } = value;
  if (
    !isShortText(algorithmKey, MAX_ALGORITHM_KEY_LENGTH) ||
    !ALGORITHM_KEY_PATTERN.test(algorithmKey)
  ) {
    return invalid("Mã thuật toán trong ngữ cảnh không hợp lệ.");
  }
  if (
    !isRecord(step) ||
    !isNonNegativeInteger(step.index) ||
    !isNonNegativeInteger(step.total) ||
    step.index >= step.total
  ) {
    return invalid("Thông tin bước trong ngữ cảnh không hợp lệ.");
  }
  if (!isShortText(step.description, MAX_DESCRIPTION_LENGTH)) {
    return invalid("Mô tả bước không phải chữ hoặc quá dài.");
  }
  if (
    !isRecord(step.payload) ||
    !isShortText(step.payload.type, MAX_PAYLOAD_TYPE_LENGTH)
  ) {
    return invalid("Thao tác của bước không hợp lệ.");
  }
  if (
    !Array.isArray(pseudocode) ||
    pseudocode.length > MAX_PSEUDOCODE_LINES ||
    !pseudocode.every(isPseudocodeLine)
  ) {
    return invalid("Mã giả trong ngữ cảnh không hợp lệ.");
  }
  if (
    activeLine !== undefined &&
    (!isNonNegativeInteger(activeLine) || activeLine >= pseudocode.length)
  ) {
    return invalid("Dòng mã giả đang chạy không hợp lệ.");
  }
  if (
    !Array.isArray(metrics) ||
    metrics.length > MAX_METRICS ||
    !metrics.every(isMetric)
  ) {
    return invalid("Chỉ số trong ngữ cảnh không hợp lệ.");
  }

  return {
    type: "valid",
    context: {
      algorithmKey,
      input,
      step: {
        index: step.index,
        total: step.total,
        description: step.description,
        payload: { ...step.payload, type: step.payload.type },
        state: step.state,
      },
      pseudocode,
      activeLine,
      metrics: metrics.map((metric) => ({
        label: metric.label,
        value: metric.value,
      })),
    },
  };
}
