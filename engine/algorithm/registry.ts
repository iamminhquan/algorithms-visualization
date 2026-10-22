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

/** Ném ra khi `getAlgorithm` không tìm thấy thuật toán với key được yêu cầu. */
export class UnknownAlgorithmError extends Error {
  /** @param algorithmKey Key không tìm thấy trong registry. */
  constructor(readonly algorithmKey: string) {
    super(`Không tìm thấy thuật toán "${algorithmKey}"`);
    this.name = "UnknownAlgorithmError";
  }
}

/** Ném ra khi tạo registry mà có hai thuật toán trùng key. */
export class DuplicateAlgorithmError extends Error {
  /** @param algorithmKey Key bị đăng ký nhiều lần. */
  constructor(readonly algorithmKey: string) {
    super(`Thuật toán "${algorithmKey}" đã được đăng ký`);
    this.name = "DuplicateAlgorithmError";
  }
}

/**
 * Danh bạ các thuật toán đã đăng ký, tra cứu theo key.
 *
 * @template TDefinition Union các thuật toán đã đăng ký; giữ kiểu riêng của từng thuật toán
 *   để `getAlgorithm` trả về đúng kiểu input/kết quả.
 */
export interface IAlgorithmRegistry<
  TDefinition extends AnyAlgorithmDefinition,
> {
  /**
   * Lấy thuật toán theo key đã biết lúc biên dịch; giữ nguyên kiểu input/kết quả của nó.
   *
   * @param key Key của thuật toán, ví dụ `"bubble-sort"`.
   * @returns Thuật toán có key này.
   * @throws {UnknownAlgorithmError} Nếu không có thuật toán nào mang key này.
   */
  getAlgorithm<TKey extends AlgorithmKey<TDefinition>>(
    key: TKey,
  ): DefinitionByKey<TDefinition, TKey>;
  /**
   * Tra cứu theo chuỗi lúc chạy, ví dụ cột `key` đọc từ bảng `algorithms`.
   *
   * @param key Chuỗi key bất kỳ, chưa được kiểm tra.
   * @returns Thuật toán có key này, hoặc `undefined` nếu không có.
   */
  findAlgorithm(key: string): TDefinition | undefined;
  /**
   * Metadata của mọi thuật toán, theo thứ tự đăng ký.
   *
   * @returns Mảng đã bị đóng băng, cùng một tham chiếu ở mọi lần gọi.
   */
  listAlgorithmInfo(): readonly IAlgorithmMetadata[];
}

/**
 * Tạo registry từ danh sách thuật toán cố định. Registry không đổi sau khi tạo,
 * và key trùng bị từ chối ngay để lỗi cấu hình lộ ra sớm thay vì âm thầm ghi đè.
 *
 * @template TDefinitions Tuple các thuật toán, suy ra từ `definitions` nhờ `const`
 *   để giữ key literal của từng thuật toán.
 * @param definitions Các thuật toán cần đăng ký; thứ tự ở đây là thứ tự `listAlgorithmInfo` trả về.
 * @returns Registry chỉ đọc chứa đúng các thuật toán này.
 * @throws {DuplicateAlgorithmError} Nếu có hai thuật toán trùng `metadata.key`.
 */
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
