import { describe, expect, test } from "bun:test";
import {
  getEventIndex,
  getStepCount,
  isReadyStep,
  READY_STEP_DESCRIPTION,
} from "@/engine/visualization";

describe("bước sẵn sàng", () => {
  test("mỗi vết có thêm một bước sẵn sàng ở đầu", () => {
    expect(getStepCount(0)).toBe(1);
    expect(getStepCount(5)).toBe(6);
    expect(getStepCount(-2)).toBe(1);
  });

  test("bước 0 là sẵn sàng, bước 1 mới là sự kiện đầu tiên", () => {
    expect(isReadyStep(0)).toBe(true);
    expect(isReadyStep(1)).toBe(false);
    expect(getEventIndex(0)).toBe(-1);
    expect(getEventIndex(1)).toBe(0);
  });

  test("lời nhắc trước khi chạy thuật toán", () => {
    expect(READY_STEP_DESCRIPTION).toBe("Nhấn bắt đầu để thực hiện thuật toán");
  });
});
