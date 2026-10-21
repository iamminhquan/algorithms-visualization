import { describe, expect, test } from "bun:test";
import {
  BUBBLE_SORT_ID,
  bubbleSort,
} from "@/features/algorithm/algorithms/sorting/bubble-sort";
import { getAlgorithm, listAlgorithms } from "@/features/algorithm/catalog";
import {
  createAlgorithmRegistry,
  DuplicateAlgorithmError,
  type IAlgorithmDefinition,
  type IExecutionEvent,
  type IExecutionResult,
  UnknownAlgorithmError,
} from "@/features/algorithm/engine";

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
  "searching.lookup-fixture"
> = {
  metadata: {
    id: "searching.lookup-fixture",
    name: "Tra cứu giả lập",
    category: "searching",
    description: "Thuật toán giả dùng trong test",
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
  test("lấy được thuật toán đã đăng ký theo id", () => {
    const registry = createAlgorithmRegistry([bubbleSort]);
    expect(registry.get(BUBBLE_SORT_ID)).toBe(bubbleSort);
    expect(registry.find(BUBBLE_SORT_ID)).toBe(bubbleSort);
  });

  test("liệt kê metadata theo thứ tự đăng ký", () => {
    const registry = createAlgorithmRegistry([bubbleSort, lookupFixture]);
    expect(registry.list().map((metadata) => metadata.id)).toEqual([
      "sorting.bubble-sort",
      "searching.lookup-fixture",
    ]);
    expect(registry.list()[0]).toEqual(bubbleSort.metadata);
  });

  test("id không tồn tại: get ném UnknownAlgorithmError, find trả về undefined", () => {
    const registry = createAlgorithmRegistry([bubbleSort]);
    expect(registry.find("sorting.khong-ton-tai")).toBeUndefined();
    // @ts-expect-error id không có trong registry bị chặn ngay lúc biên dịch
    expect(() => registry.get("sorting.khong-ton-tai")).toThrow(
      UnknownAlgorithmError,
    );
  });

  test("từ chối đăng ký trùng id", () => {
    expect(() => createAlgorithmRegistry([bubbleSort, bubbleSort])).toThrow(
      DuplicateAlgorithmError,
    );
  });

  test("chứa được thuật toán khác nhóm và giữ đúng kiểu riêng của từng thuật toán", () => {
    const registry = createAlgorithmRegistry([bubbleSort, lookupFixture]);

    const sorted = registry.get("sorting.bubble-sort").execute([3, 1, 2]);
    const found = registry
      .get("searching.lookup-fixture")
      .execute({ keys: ["a", "b", "c"], target: "b" });

    /*
     * Các phép gán dưới đây chỉ biên dịch được nếu get() trả về đúng kiểu cụ thể.
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
    expect(found.metadata.category).toBe("searching");
  });
});

describe("catalog", () => {
  test("đăng ký Bubble Sort với id ổn định", () => {
    expect(listAlgorithms().map((metadata) => metadata.id)).toContain(
      "sorting.bubble-sort",
    );
    const result = getAlgorithm("sorting.bubble-sort").execute([5, 3, 8, 1]);
    expect(result.output).toEqual([1, 3, 5, 8]);
    expect(result.metadata.id).toBe("sorting.bubble-sort");
  });
});
