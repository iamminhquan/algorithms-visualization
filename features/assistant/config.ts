import {
  ASSISTANT_PROVIDERS,
  type AssistantProviderId,
} from "@/engine/assistant";
import {
  type IProviderConfig,
  PROVIDER_DEFINITIONS,
} from "./providers/registry";

export type { IProviderConfig } from "./providers/registry";

export interface IAssistantConfig {
  readonly providers: Readonly<
    Partial<Record<AssistantProviderId, IProviderConfig>>
  >;
  readonly redisUrl?: string;
}

type EnvironmentVariables = Readonly<Record<string, string | undefined>>;

function readValue(
  env: EnvironmentVariables,
  name: string,
): string | undefined {
  const value = env[name]?.trim();
  return value === undefined || value === "" ? undefined : value;
}

function readProviderConfig(
  env: EnvironmentVariables,
  provider: AssistantProviderId,
  defaultModel: string,
): IProviderConfig | undefined {
  const prefix = provider.toUpperCase();
  const apiKey = readValue(env, `${prefix}_API_KEY`);
  if (apiKey === undefined) {
    return undefined;
  }
  return {
    apiKey,
    model: readValue(env, `${prefix}_MODEL`) ?? defaultModel,
    baseURL: readValue(env, `${prefix}_BASE_URL`),
  };
}

export function readAssistantConfig(
  env: EnvironmentVariables,
): IAssistantConfig {
  const providers: Partial<Record<AssistantProviderId, IProviderConfig>> = {};
  for (const { id } of ASSISTANT_PROVIDERS) {
    const provider = readProviderConfig(
      env,
      id,
      PROVIDER_DEFINITIONS[id].defaultModel,
    );
    if (provider !== undefined) {
      providers[id] = provider;
    }
  }
  return {
    providers,
    redisUrl: readValue(env, "REDIS_URL"),
  };
}
