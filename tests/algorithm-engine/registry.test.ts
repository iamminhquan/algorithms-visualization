import { describe, expect, test } from "bun:test";
import {
  createAlgorithmRegistry,
  DuplicateAlgorithmError,
  type IAlgorithmDefinition,
  type IExecutionEvent,
  type IExecutionResult,
  UnknownAlgorithmError,
} from "@/engine/algorithm";
import {
  BUBBLE_SORT_KEY,
  bubbleSort,
} from "@/features/algorithm/algorithms/sorting/bubble-sort";
import { getAlgorithm, listAlgorithmInfo } from "@/features/algorithm/catalog";

const LOOKUP_FIXTURE_KEY = "lookup-fixture";

type LookupEvent = IExecutionEvent<
  { readonly type: "inspect"; readonly key: string },
  { readonly inspected: readonly string[] }
>;
type LookupResult = IExecutionResult<
  boolean,
  LookupEvent,
  { readonly inspections: number }
>;

/**
 * Thuật toán giả thuộc nhóm khác, với input/kết quả/sự kiện không liên quan gì tới sắp xếp,
 * để chứng minh registry không áp mô hình sắp xếp lên mọi thuật toán.
 */
const lookupFixture: IAlgorithmDefinition<
  { readonly keys: readonly string[]; readonly target: string },
  LookupResult,
  typeof LOOKUP_FIXTURE_KEY
> = {
  metadata: {
    key: LOOKUP_FIXTURE_KEY,
  },
  execute({ keys, target }) {
    const events: LookupEvent[] = [];
    for (const [index, key] of keys.entries()) {
      events.push({
        description: `Kiểm tra khoá ${key}`,
        payload: { type: "inspect", key },
        state: { inspected: keys.slice(0, index + 1) },
      });
      if (key === target) {
        break;
      }
    }
    return {
      metadata: lookupFixture.metadata,
      output: keys.includes(target),
      events,
      metrics: { inspections: events.length },
    };
  },
};

describe("createAlgorithmRegistry", () => {
  test("lấy được thuật toán đã đăng ký theo key", () => {
    const registry = createAlgorithmRegistry([bubbleSort]);
    expect(registry.getAlgorithm(BUBBLE_SORT_KEY)).toBe(bubbleSort);
    expect(registry.findAlgorithm(BUBBLE_SORT_KEY)).toBe(bubbleSort);
  });

  test("liệt kê metadata theo thứ tự đăng ký", () => {
    const registry = createAlgorithmRegistry([bubbleSort, lookupFixture]);
    expect(
      registry.listAlgorithmInfo().map((metadata) => metadata.key),
    ).toEqual([BUBBLE_SORT_KEY, LOOKUP_FIXTURE_KEY]);
    expect(registry.listAlgorithmInfo()[0]).toEqual(bubbleSort.metadata);
  });

  test("key không tồn tại: getAlgorithm ném UnknownAlgorithmError, findAlgorithm trả về undefined", () => {
    const registry = createAlgorithmRegistry([bubbleSort]);
    expect(registry.findAlgorithm("khong-ton-tai")).toBeUndefined();
    // @ts-expect-error key không có trong registry bị chặn ngay lúc biên dịch
    expect(() => registry.getAlgorithm("khong-ton-tai")).toThrow(
      UnknownAlgorithmError,
    );
  });

  test("từ chối đăng ký trùng key", () => {
    expect(() => createAlgorithmRegistry([bubbleSort, bubbleSort])).toThrow(
      DuplicateAlgorithmError,
    );
  });

  test("chứa được thuật toán khác nhóm và giữ đúng kiểu riêng của từng thuật toán", () => {
    const registry = createAlgorithmRegistry([bubbleSort, lookupFixture]);

    const sorted = registry.getAlgorithm(BUBBLE_SORT_KEY).execute([3, 1, 2]);
    const found = registry
      .getAlgorithm(LOOKUP_FIXTURE_KEY)
      .execute({ keys: ["a", "b", "c"], target: "b" });

    /*
     * Các phép gán dưới đây chỉ biên dịch được nếu getAlgorithm() trả về đúng kiểu cụ thể.
     */
    const sortedOutput: readonly number[] = sorted.output;
    const swaps: number = sorted.metrics.swaps;
    const foundOutput: boolean = found.output;
    const inspections: number = found.metrics.inspections;

    expect(sortedOutput).toEqual([1, 2, 3]);
    expect(swaps).toBe(2);
    expect(foundOutput).toBe(true);
    expect(inspections).toBe(2);
    expect(found.events.map((event) => event.payload.key)).toEqual(["a", "b"]);
    expect(found.metadata.key).toBe(LOOKUP_FIXTURE_KEY);
  });
});

describe("catalog", () => {
  test("đăng ký Bubble Sort với key ổn định", () => {
    expect(listAlgorithmInfo().map((metadata) => metadata.key)).toContain(
      BUBBLE_SORT_KEY,
    );
    const result = getAlgorithm(BUBBLE_SORT_KEY).execute([5, 3, 8, 1]);
    expect(result.output).toEqual([1, 3, 5, 8]);
    expect(result.metadata.key).toBe(BUBBLE_SORT_KEY);
  });
});
