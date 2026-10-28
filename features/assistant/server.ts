import "server-only";
import { getAlgorithmCatalog } from "@/features/catalog/queries";
import { readAssistantConfig } from "./config";
import type { IAssistantDependencies } from "./handler";
import type { IAssistantAlgorithmInfo } from "./prompt";
import { createAssistantProviders } from "./providers";

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

export function getAssistantDependencies(): IAssistantDependencies {
  dependencies ??= {
    providers: createAssistantProviders(readAssistantConfig(process.env)),
    lookupAlgorithm,
  };
  return dependencies;
}
