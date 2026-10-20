import { describe, expect, test } from "bun:test";
import { createRecorder } from "./recorder";

describe("createRecorder", () => {
  test("init step", () => {
    const steps = createRecorder([3, 1, 2]).finish();
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({
      index: 0,
      action: "init",
      array: [3, 1, 2],
      states: ["default", "default", "default"],
      indices: [],
      message: "Bắt đầu với mảng gồm 3 phần tử",
      comparisons: 0,
      swaps: 0,
    });
  });

  test("compare records step and returns difference", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    expect(array.compare(0, 1)).toBe(2);
    const step = finish()[1];
    expect(step.action).toBe("compare");
    expect(step.indices).toEqual([0, 1]);
    expect(step.states).toEqual(["comparing", "comparing", "default"]);
    expect(step.comparisons).toBe(1);
    expect(step.swaps).toBe(0);
    expect(step.message).toBe("So sánh a[0] = 3 và a[1] = 1");
  });

  test("swap records array after swap", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    array.swap(0, 1);
    const step = finish()[1];
    expect(step.action).toBe("swap");
    expect(step.array).toEqual([1, 3, 2]);
    expect(step.states).toEqual(["swapping", "swapping", "default"]);
    expect(step.swaps).toBe(1);
    expect(step.comparisons).toBe(0);
    expect(step.message).toBe("Hoán đổi a[0] và a[1] (3 ↔ 1)");
    expect(array.get(0)).toBe(1);
  });

  test("sorted persists across later steps", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    array.markSorted(0);
    array.compare(1, 2);
    const steps = finish();
    expect(steps[1].action).toBe("mark-sorted");
    expect(steps[1].states).toEqual(["sorted", "default", "default"]);
    expect(steps[1].message).toBe("a[0] = 3 đã nằm đúng vị trí");
    expect(steps[2].states[0]).toBe("sorted");
  });

  test("action state wins over sorted", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    array.markSorted(0);
    array.compare(0, 1);
    array.compare(1, 2);
    const steps = finish();
    expect(steps[2].states[0]).toBe("comparing");
    expect(steps[3].states[0]).toBe("sorted");
  });

  test("done marks everything sorted", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    array.compare(0, 1);
    array.swap(0, 1);
    const steps = finish();
    const last = steps[steps.length - 1];
    expect(last.action).toBe("done");
    expect(last.states).toEqual(["sorted", "sorted", "sorted"]);
    expect(last.indices).toEqual([]);
    expect(last.comparisons).toBe(1);
    expect(last.swaps).toBe(1);
    expect(last.message).toBe("Hoàn tất: 1 lần so sánh, 1 lần hoán đổi");
  });

  test("custom message overrides default", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    array.compare(0, 1, "Tuỳ chỉnh");
    expect(finish()[1].message).toBe("Tuỳ chỉnh");
  });

  test("step index is sequential", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    array.compare(0, 1);
    array.swap(0, 1);
    array.markSorted(2);
    expect(finish().map((s) => s.index)).toEqual([0, 1, 2, 3, 4]);
  });

  test("snapshots are independent", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    array.swap(0, 1);
    expect(finish()[0].array).toEqual([3, 1, 2]);
  });

  test("invalid index throws", () => {
    const { array, finish } = createRecorder([3, 1, 2]);
    expect(() => array.compare(0, 3)).toThrow(RangeError);
    expect(() => array.swap(-1, 0)).toThrow(RangeError);
    expect(() => array.markSorted(1.5)).toThrow(RangeError);
    expect(() => array.get(3)).toThrow(RangeError);
    expect(finish()).toHaveLength(2);
  });

  test("does not mutate input", () => {
    const input = [3, 1, 2];
    createRecorder(input).array.swap(0, 1);
    expect(input).toEqual([3, 1, 2]);
  });

  test("steps are frozen", () => {
    const step = createRecorder([3, 1, 2]).finish()[0];
    expect(Object.isFrozen(step)).toBe(true);
    expect(Object.isFrozen(step.array)).toBe(true);
    expect(Object.isFrozen(step.states)).toBe(true);
    expect(Object.isFrozen(step.indices)).toBe(true);
  });

  test("length", () => {
    expect(createRecorder([3, 1, 2]).array.length).toBe(3);
  });
});
