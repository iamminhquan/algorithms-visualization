import type { AlgorithmMetadata, AnyAlgorithmDefinition } from "./types";

type AlgorithmId<TDefinition extends AnyAlgorithmDefinition> =
  TDefinition["metadata"]["id"];

type DefinitionById<
  TDefinition extends AnyAlgorithmDefinition,
  TId extends string,
> = Extract<TDefinition, { readonly metadata: { readonly id: TId } }>;

export class UnknownAlgorithmError extends Error {
  constructor(readonly algorithmId: string) {
    super(`Không tìm thấy thuật toán "${algorithmId}"`);
    this.name = "UnknownAlgorithmError";
  }
}

export class DuplicateAlgorithmError extends Error {
  constructor(readonly algorithmId: string) {
    super(`Thuật toán "${algorithmId}" đã được đăng ký`);
    this.name = "DuplicateAlgorithmError";
  }
}

export interface AlgorithmRegistry<TDefinition extends AnyAlgorithmDefinition> {
  /** Lấy thuật toán theo id đã biết lúc biên dịch; giữ nguyên kiểu input/kết quả của nó. Ném lỗi nếu không có. */
  get<TId extends AlgorithmId<TDefinition>>(
    id: TId,
  ): DefinitionById<TDefinition, TId>;
  /** Tra cứu theo chuỗi lúc chạy (ví dụ id lấy từ URL); trả về `undefined` nếu không có. */
  find(id: string): TDefinition | undefined;
  /** Metadata của mọi thuật toán, theo thứ tự đăng ký. */
  list(): readonly AlgorithmMetadata[];
}

/**
 * Tạo registry từ danh sách thuật toán cố định. Registry không đổi sau khi tạo,
 * và id trùng bị từ chối ngay để lỗi cấu hình lộ ra sớm thay vì âm thầm ghi đè.
 */
export function createAlgorithmRegistry<
  const TDefinitions extends readonly AnyAlgorithmDefinition[],
>(definitions: TDefinitions): AlgorithmRegistry<TDefinitions[number]> {
  type TDefinition = TDefinitions[number];

  const byId = new Map<string, TDefinition>();
  for (const definition of definitions) {
    const { id } = definition.metadata;
    if (byId.has(id)) {
      throw new DuplicateAlgorithmError(id);
    }
    byId.set(id, definition);
  }

  const metadataList = Object.freeze(
    definitions.map((definition) => definition.metadata),
  );

  return {
    get<TId extends AlgorithmId<TDefinition>>(id: TId) {
      const definition = byId.get(id);
      if (!definition) {
        throw new UnknownAlgorithmError(id);
      }
      // Map được đánh khoá bằng metadata.id nên definition chắc chắn có đúng id này
      return definition as DefinitionById<TDefinition, TId>;
    },
    find: (id) => byId.get(id),
    list: () => metadataList,
  };
}
