import type { AnyAlgorithmDefinition, IAlgorithmMetadata } from "./types";

/**
 * Union các id literal của những thuật toán trong `TDefinition`.
 *
 * @template TDefinition Union các thuật toán đã đăng ký.
 */
type AlgorithmId<TDefinition extends AnyAlgorithmDefinition> =
  TDefinition["metadata"]["id"];

/**
 * Lấy ra đúng thuật toán có id `TId` từ union `TDefinition`.
 *
 * @template TDefinition Union các thuật toán đã đăng ký.
 * @template TId Id cần tìm.
 */
type DefinitionById<
  TDefinition extends AnyAlgorithmDefinition,
  TId extends string,
> = Extract<TDefinition, { readonly metadata: { readonly id: TId } }>;

/** Ném ra khi `get` không tìm thấy thuật toán với id được yêu cầu. */
export class UnknownAlgorithmError extends Error {
  /** @param algorithmId Id không tìm thấy trong registry. */
  constructor(readonly algorithmId: string) {
    super(`Không tìm thấy thuật toán "${algorithmId}"`);
    this.name = "UnknownAlgorithmError";
  }
}

/** Ném ra khi tạo registry mà có hai thuật toán trùng id. */
export class DuplicateAlgorithmError extends Error {
  /** @param algorithmId Id bị đăng ký nhiều lần. */
  constructor(readonly algorithmId: string) {
    super(`Thuật toán "${algorithmId}" đã được đăng ký`);
    this.name = "DuplicateAlgorithmError";
  }
}

/**
 * Danh bạ các thuật toán đã đăng ký, tra cứu theo id.
 *
 * @template TDefinition Union các thuật toán đã đăng ký; giữ kiểu riêng của từng thuật toán
 *   để `get` trả về đúng kiểu input/kết quả.
 */
export interface IAlgorithmRegistry<
  TDefinition extends AnyAlgorithmDefinition,
> {
  /**
   * Lấy thuật toán theo id đã biết lúc biên dịch; giữ nguyên kiểu input/kết quả của nó.
   *
   * @param id Id của thuật toán, ví dụ `"sorting.bubble-sort"`.
   * @returns Thuật toán có id này.
   * @throws {UnknownAlgorithmError} Nếu không có thuật toán nào mang id này.
   */
  get<TId extends AlgorithmId<TDefinition>>(
    id: TId,
  ): DefinitionById<TDefinition, TId>;
  /**
   * Tra cứu theo chuỗi lúc chạy, ví dụ id lấy từ URL.
   *
   * @param id Chuỗi id bất kỳ, chưa được kiểm tra.
   * @returns Thuật toán có id này, hoặc `undefined` nếu không có.
   */
  find(id: string): TDefinition | undefined;
  /**
   * Metadata của mọi thuật toán, theo thứ tự đăng ký.
   *
   * @returns Mảng đã bị đóng băng, cùng một tham chiếu ở mọi lần gọi.
   */
  list(): readonly IAlgorithmMetadata[];
}

/**
 * Tạo registry từ danh sách thuật toán cố định. Registry không đổi sau khi tạo,
 * và id trùng bị từ chối ngay để lỗi cấu hình lộ ra sớm thay vì âm thầm ghi đè.
 *
 * @template TDefinitions Tuple các thuật toán, suy ra từ `definitions` nhờ `const`
 *   để giữ id literal của từng thuật toán.
 * @param definitions Các thuật toán cần đăng ký; thứ tự ở đây là thứ tự `list` trả về.
 * @returns Registry chỉ đọc chứa đúng các thuật toán này.
 * @throws {DuplicateAlgorithmError} Nếu có hai thuật toán trùng `metadata.id`.
 */
export function createAlgorithmRegistry<
  const TDefinitions extends readonly AnyAlgorithmDefinition[],
>(definitions: TDefinitions): IAlgorithmRegistry<TDefinitions[number]> {
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
      /*
       * Map được đánh khoá bằng metadata.id nên definition chắc chắn có đúng id này.
       */
      return definition as DefinitionById<TDefinition, TId>;
    },
    find: (id) => byId.get(id),
    list: () => metadataList,
  };
}
