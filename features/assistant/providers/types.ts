import type {
  AssistantFinishReason,
  AssistantProviderId,
  IAssistantMessage,
} from "@/engine/assistant";

export interface IProviderRequest {
  readonly system: string;
  readonly messages: readonly IAssistantMessage[];
  readonly maxOutputTokens: number;
  readonly signal: AbortSignal;
}

export type ProviderChunk =
  | { readonly type: "text"; readonly text: string }
  | { readonly type: "finish"; readonly finish: AssistantFinishReason };

export interface IAssistantProvider {
  readonly id: AssistantProviderId;
  readonly stream: (request: IProviderRequest) => AsyncIterable<ProviderChunk>;
}

export type ProviderFailure =
  | "aborted"
  | "auth"
  | "billing"
  | "rate-limited"
  | "bad-request"
  | "unavailable";

export class AssistantProviderError extends Error {
  constructor(
    readonly provider: AssistantProviderId,
    readonly failure: ProviderFailure,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AssistantProviderError";
  }
}

export function failureFromStatus(status: number): ProviderFailure {
  if (status === 401 || status === 403) {
    return "auth";
  }
  if (status === 402) {
    return "billing";
  }
  if (status === 429) {
    return "rate-limited";
  }
  if (status >= 400 && status < 500) {
    return "bad-request";
  }
  return "unavailable";
}
