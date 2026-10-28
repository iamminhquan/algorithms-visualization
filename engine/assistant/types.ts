export const ASSISTANT_PROVIDERS = ["deepseek", "gemini"] as const;

export type AssistantProviderId = (typeof ASSISTANT_PROVIDERS)[number];

export const ASSISTANT_PROVIDER_LABELS: Readonly<
  Record<AssistantProviderId, string>
> = {
  deepseek: "DeepSeek",
  gemini: "Gemini",
};

export const DEFAULT_ASSISTANT_PROVIDER: AssistantProviderId = "deepseek";

export type AssistantRole = "user" | "assistant";

export interface IAssistantMessage {
  readonly role: AssistantRole;
  readonly content: string;
}

export interface IAssistantRequest {
  readonly provider: AssistantProviderId;
  readonly messages: readonly IAssistantMessage[];
}

export function isAssistantProviderId(
  value: unknown,
): value is AssistantProviderId {
  return ASSISTANT_PROVIDERS.some((provider) => provider === value);
}
