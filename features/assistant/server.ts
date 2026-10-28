import "server-only";
import { getAlgorithmCatalog } from "@/features/catalog/queries";
import { readAssistantConfig } from "./config";
import type { IAssistantDependencies } from "./handler";
import type { IAssistantAlgorithmInfo } from "./prompt";
import { createAssistantProviders } from "./providers";
import {
  createMemoryRateLimitStore,
  createRateLimiter,
  type IRateLimiter,
} from "./rate-limit";
import { createRedisRateLimitStore } from "./redis-rate-limit-store";

let dependencies: IAssistantDependencies | undefined;

async function lookupAlgorithm(
  key: string,
): Promise<IAssistantAlgorithmInfo | undefined> {
  const algorithm = (await getAlgorithmCatalog()).find(
    (entry) => entry.key === key,
  );
  return algorithm === undefined
    ? undefined
    : {
        key: algorithm.key,
        name: algorithm.name,
        categoryName: algorithm.category.name,
        description: algorithm.description,
        timeComplexity: algorithm.timeComplexity,
        spaceComplexity: algorithm.spaceComplexity,
      };
}

function createAssistantRateLimiter(
  redisUrl: string | undefined,
): IRateLimiter {
  const memoryStore = createMemoryRateLimitStore();
  return redisUrl === undefined
    ? createRateLimiter({ store: memoryStore })
    : createRateLimiter({
        store: createRedisRateLimitStore(redisUrl),
        fallback: memoryStore,
      });
}

export function getAssistantDependencies(): IAssistantDependencies {
  if (dependencies === undefined) {
    const config = readAssistantConfig(process.env);
    dependencies = {
      providers: createAssistantProviders(config),
      rateLimiter: createAssistantRateLimiter(config.redisUrl),
      lookupAlgorithm,
    };
  }
  return dependencies;
}
