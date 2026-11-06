import type { AnyAlgorithmDefinition, IAlgorithmMetadata } from "./types";

/**
 * Union các key literal của những thuật toán trong `TDefinition`.
 *
 * @template TDefinition Union các thuật toán đã đăng ký.
 */
type AlgorithmKey<TDefinition extends AnyAlgorithmDefinition> =
  TDefinition["metadata"]["key"];

/**
 * Lấy ra đúng thuật toán có key `TKey` từ union `TDefinition`.
 *
 * @template TDefinition Union các thuật toán đã đăng ký.
 * @template TKey Key cần tìm.
 */
type DefinitionByKey<
  TDefinition extends AnyAlgorithmDefinition,
  TKey extends string,
> = Extract<TDefinition, { readonly metadata: { readonly key: TKey } }>;

export class UnknownAlgorithmError extends Error {
  constructor(readonly algorithmKey: string) {
    super(`Không tìm thấy thuật toán "${algorithmKey}"`);
    this.name = "UnknownAlgorithmError";
  }
}

export class DuplicateAlgorithmError extends Error {
  constructor(readonly algorithmKey: string) {
    super(`Thuật toán "${algorithmKey}" đã được đăng ký`);
    this.name = "DuplicateAlgorithmError";
  }
}

/**
 * Các thuật toán đã đăng ký, tra cứu theo key.
 */
export interface IAlgorithmRegistry<
  TDefinition extends AnyAlgorithmDefinition,
> {
  getAlgorithm<TKey extends AlgorithmKey<TDefinition>>(
    key: TKey,
  ): DefinitionByKey<TDefinition, TKey>;
  findAlgorithm(key: string): TDefinition | undefined;
  listAlgorithmInfo(): readonly IAlgorithmMetadata[];
}

export function createAlgorithmRegistry<
  const TDefinitions extends readonly AnyAlgorithmDefinition[],
>(definitions: TDefinitions): IAlgorithmRegistry<TDefinitions[number]> {
  type TDefinition = TDefinitions[number];

  const byKey = new Map<string, TDefinition>();
  for (const definition of definitions) {
    const { key } = definition.metadata;
    if (byKey.has(key)) {
      throw new DuplicateAlgorithmError(key);
    }
    byKey.set(key, definition);
  }

  const metadataList = Object.freeze(
    definitions.map((definition) => definition.metadata),
  );

  return {
    getAlgorithm<TKey extends AlgorithmKey<TDefinition>>(key: TKey) {
      const definition = byKey.get(key);
      if (!definition) {
        throw new UnknownAlgorithmError(key);
      }

      /*
       * Trả về định nghĩa của thuật toán dựa trên ánh xạ giữa algorithms.key và key từ client.
       */
      return definition as DefinitionByKey<TDefinition, TKey>;
    },
    findAlgorithm: (key) => byKey.get(key),
    listAlgorithmInfo: () => metadataList,
  };
}
