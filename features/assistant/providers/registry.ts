import type { AssistantProviderId } from "@/engine/assistant";
import { createDeepSeekProvider, DEEPSEEK_DEFAULT_MODEL } from "./deepseek";
import { createGeminiProvider, GEMINI_DEFAULT_MODEL } from "./gemini";
import type { IAssistantProvider } from "./types";

export interface IProviderConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly baseURL?: string;
}

export interface IProviderDefinition {
  readonly defaultModel: string;
  readonly create: (config: IProviderConfig) => IAssistantProvider;
}

export const PROVIDER_DEFINITIONS: Readonly<
  Record<AssistantProviderId, IProviderDefinition>
> = {
  deepseek: {
    defaultModel: DEEPSEEK_DEFAULT_MODEL,
    create: createDeepSeekProvider,
  },
  gemini: {
    defaultModel: GEMINI_DEFAULT_MODEL,
    create: createGeminiProvider,
  },
};
