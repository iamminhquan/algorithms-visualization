import { describe, expect, test } from "bun:test";
import {
  ASSISTANT_RATE_LIMIT,
  createMemoryRateLimitStore,
  createRateLimiter,
  formatRetryAfter,
  getClientId,
  type IRateLimitStore,
} from "@/features/assistant/rate-limit";

function createClock(start = 1_000_000) {
  let time = start;
  return {
    now: () => time,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

const failingStore: IRateLimitStore = {
  increment: () => Promise.reject(new Error("Redis chết")),
};

describe("createMemoryRateLimitStore", () => {
  test("đếm số lượt trong cùng cửa sổ thời gian", async () => {
    const clock = createClock();
    const store = createMemoryRateLimitStore(clock.now);
    expect(await store.increment("a", 1000)).toEqual({
      count: 1,
      resetAt: clock.now() + 1000,
    });
    clock.advance(500);
    expect(await store.increment("a", 1000)).toEqual({
      count: 2,
      resetAt: clock.now() + 500,
    });
    expect((await store.increment("b", 1000)).count).toBe(1);
  });

  test("hết cửa sổ thì đếm lại từ đầu", async () => {
    const clock = createClock();
    const store = createMemoryRateLimitStore(clock.now);
    await store.increment("a", 1000);
    await store.increment("a", 1000);
    clock.advance(1000);
    expect((await store.increment("a", 1000)).count).toBe(1);
  });
});

describe("createRateLimiter", () => {
  test("cho phép đủ số lượt rồi chặn kèm thời gian chờ", async () => {
    const clock = createClock();
    const limiter = createRateLimiter({
      store: createMemoryRateLimitStore(clock.now),
      maxRequests: 2,
      windowMs: 60_000,
      now: clock.now,
    });
    expect(await limiter.check("ip")).toEqual({
      type: "allowed",
      remaining: 1,
    });
    expect(await limiter.check("ip")).toEqual({
      type: "allowed",
      remaining: 0,
    });
    clock.advance(15_000);
    expect(await limiter.check("ip")).toEqual({
      type: "limited",
      retryAfterSeconds: 45,
    });
    expect((await limiter.check("ip-khác")).type).toBe("allowed");
    clock.advance(45_000);
    expect((await limiter.check("ip")).type).toBe("allowed");
  });

  test("thời gian chờ ít nhất 1 giây", async () => {
    const clock = createClock();
    const limiter = createRateLimiter({
      store: {
        increment: async () => ({ count: 99, resetAt: clock.now() - 10 }),
      },
      maxRequests: 1,
      now: clock.now,
    });
    expect(await limiter.check("ip")).toEqual({
      type: "limited",
      retryAfterSeconds: 1,
    });
  });

  test("Redis lỗi thì chuyển sang đếm trong bộ nhớ và báo lỗi", async () => {
    const errors: unknown[] = [];
    const clock = createClock();
    const limiter = createRateLimiter({
      store: failingStore,
      fallback: createMemoryRateLimitStore(clock.now),
      maxRequests: 1,
      now: clock.now,
      onStoreError: (error) => errors.push(error),
    });
    expect((await limiter.check("ip")).type).toBe("allowed");
    expect((await limiter.check("ip")).type).toBe("limited");
    expect(errors).toHaveLength(2);
  });

  test("không có nơi đếm nào chạy được thì cho qua thay vì chặn người dùng", async () => {
    const limiter = createRateLimiter({
      store: failingStore,
      maxRequests: 1,
      onStoreError: () => undefined,
    });
    expect((await limiter.check("ip")).type).toBe("allowed");
    expect((await limiter.check("ip")).type).toBe("allowed");
  });

  test("giới hạn mặc định là 20 câu hỏi mỗi 10 phút", () => {
    expect(ASSISTANT_RATE_LIMIT).toEqual({
      maxRequests: 20,
      windowMs: 600_000,
    });
  });
});

describe("getClientId", () => {
  test("lấy IP đầu tiên trong x-forwarded-for", () => {
    expect(
      getClientId(
        new Headers({ "x-forwarded-for": " 203.0.113.5 , 10.0.0.1" }),
      ),
    ).toBe("203.0.113.5");
  });

  test("không có x-forwarded-for thì dùng x-real-ip, không có nữa thì unknown", () => {
    expect(getClientId(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe(
      "198.51.100.7",
    );
    expect(getClientId(new Headers({ "x-forwarded-for": " " }))).toBe(
      "unknown",
    );
    expect(getClientId(new Headers())).toBe("unknown");
  });
});

describe("formatRetryAfter", () => {
  test("dưới một phút ghi theo giây, từ một phút trở lên làm tròn lên theo phút", () => {
    expect(formatRetryAfter(1)).toBe("1 giây");
    expect(formatRetryAfter(59)).toBe("59 giây");
    expect(formatRetryAfter(60)).toBe("1 phút");
    expect(formatRetryAfter(61)).toBe("2 phút");
  });
});
