import { ASSISTANT_PROVIDERS } from "@/engine/assistant";
import type { IAssistantConfig } from "../config";
import { PROVIDER_DEFINITIONS } from "./registry";
import type { IAssistantProvider } from "./types";

export function createAssistantProviders(
  config: IAssistantConfig,
): readonly IAssistantProvider[] {
  const providers: IAssistantProvider[] = [];
  for (const { id } of ASSISTANT_PROVIDERS) {
    const providerConfig = config.providers[id];
    if (providerConfig !== undefined) {
      providers.push(PROVIDER_DEFINITIONS[id].create(providerConfig));
    }
  }
  return providers;
}
