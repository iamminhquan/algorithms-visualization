import "server-only";
import { readAssistantConfig } from "./config";
import type { IAssistantDependencies } from "./handler";
import { createAssistantProviders } from "./providers";

let dependencies: IAssistantDependencies | undefined;

export function getAssistantDependencies(): IAssistantDependencies {
  dependencies ??= {
    providers: createAssistantProviders(readAssistantConfig(process.env)),
  };
  return dependencies;
}
