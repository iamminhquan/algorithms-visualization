import type { IAssistantConfig } from "../config";
import { createDeepSeekProvider } from "./deepseek";
import { createGeminiProvider } from "./gemini";
import type { IAssistantProvider } from "./types";

export function createAssistantProviders(
  config: IAssistantConfig,
): readonly IAssistantProvider[] {
  const providers: IAssistantProvider[] = [];
  if (config.deepseek !== undefined) {
    providers.push(createDeepSeekProvider(config.deepseek));
  }
  if (config.gemini !== undefined) {
    providers.push(createGeminiProvider(config.gemini));
  }
  return providers;
}
