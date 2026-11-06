import type { IEventPayload } from "@/engine/algorithm";

export const ASSISTANT_PROVIDERS = [
  { id: "deepseek", label: "DeepSeek" },
  { id: "gemini", label: "Gemini" },
] as const;

export type AssistantProviderId = (typeof ASSISTANT_PROVIDERS)[number]["id"];

export function getAssistantProviderLabel(
  provider: AssistantProviderId,
): string {
  return (
    ASSISTANT_PROVIDERS.find((entry) => entry.id === provider)?.label ??
    provider
  );
}

export type AssistantRole = "user" | "assistant";

export interface IAssistantMessage {
  readonly role: AssistantRole;
  readonly content: string;
}

export interface IAssistantMetric {
  readonly label: string;
  readonly value: number | string;
}

export interface IAssistantStep {
  readonly index: number;
  readonly total: number;
  readonly description: string;
  readonly payload: IEventPayload;
  readonly state: unknown;
}

export interface IAssistantContext {
  readonly algorithmKey: string;
  readonly input: unknown;
  readonly step: IAssistantStep;
  readonly pseudocode: readonly string[];
  readonly activeLine?: number;
  readonly metrics: readonly IAssistantMetric[];
}

export interface IAssistantRequest {
  readonly messages: readonly IAssistantMessage[];
  readonly context?: IAssistantContext;
}

export function isAssistantProviderId(
  value: unknown,
): value is AssistantProviderId {
  return ASSISTANT_PROVIDERS.some((entry) => entry.id === value);
}
