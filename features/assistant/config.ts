import { DEEPSEEK_DEFAULT_MODEL } from "./providers/deepseek";
import { GEMINI_DEFAULT_MODEL } from "./providers/gemini";

export interface IProviderConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly baseURL?: string;
}

export interface IAssistantConfig {
  readonly deepseek?: IProviderConfig;
  readonly gemini?: IProviderConfig;
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
  prefix: string,
  defaultModel: string,
): IProviderConfig | undefined {
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
  return {
    deepseek: readProviderConfig(env, "DEEPSEEK", DEEPSEEK_DEFAULT_MODEL),
    gemini: readProviderConfig(env, "GEMINI", GEMINI_DEFAULT_MODEL),
    redisUrl: readValue(env, "REDIS_URL"),
  };
}
