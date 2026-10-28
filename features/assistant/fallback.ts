import type { AssistantProviderId } from "@/engine/assistant";
import {
  AssistantProviderError,
  type IAssistantProvider,
  type IProviderRequest,
  type ProviderChunk,
} from "./providers/types";

export interface IOpenedProviderStream {
  readonly provider: AssistantProviderId;
  readonly fallbackFrom?: AssistantProviderId;
  readonly first: ProviderChunk;
  readonly rest: AsyncIterator<ProviderChunk>;
}

export class NoProviderConfiguredError extends Error {
  constructor() {
    super("Chưa cấu hình API key cho mô hình AI nào");
    this.name = "NoProviderConfiguredError";
  }
}

export class AllProvidersFailedError extends Error {
  constructor(readonly failures: readonly AssistantProviderError[]) {
    super(
      `Mọi mô hình AI đều lỗi: ${failures.map((failure) => failure.message).join("; ")}`,
    );
    this.name = "AllProvidersFailedError";
  }
}

export function orderProviders(
  providers: readonly IAssistantProvider[],
  preferred: AssistantProviderId,
): readonly IAssistantProvider[] {
  return [
    ...providers.filter((provider) => provider.id === preferred),
    ...providers.filter((provider) => provider.id !== preferred),
  ];
}

function toProviderError(
  provider: AssistantProviderId,
  error: unknown,
): AssistantProviderError {
  return error instanceof AssistantProviderError
    ? error
    : new AssistantProviderError(
        provider,
        "unavailable",
        `${provider} gặp lỗi không xác định`,
        { cause: error },
      );
}

export async function openProviderStream(
  providers: readonly IAssistantProvider[],
  preferred: AssistantProviderId,
  request: IProviderRequest,
): Promise<IOpenedProviderStream> {
  if (providers.length === 0) {
    throw new NoProviderConfiguredError();
  }

  const failures: AssistantProviderError[] = [];
  for (const provider of orderProviders(providers, preferred)) {
    const iterator = provider.stream(request)[Symbol.asyncIterator]();
    try {
      const first = await iterator.next();
      if (first.done) {
        throw new AssistantProviderError(
          provider.id,
          "unavailable",
          `${provider.id} không trả về nội dung nào`,
        );
      }
      return {
        provider: provider.id,
        fallbackFrom: provider.id === preferred ? undefined : preferred,
        first: first.value,
        rest: iterator,
      };
    } catch (error) {
      const failure = toProviderError(provider.id, error);
      if (failure.failure === "aborted") {
        throw failure;
      }
      failures.push(failure);
    }
  }
  throw new AllProvidersFailedError(failures);
}
