import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createServer } from "node:net";
import { createRedisRateLimitStore } from "@/features/assistant/redis-rate-limit-store";

const REDIS_SERVER = Bun.which("redis-server");
const STARTUP_ATTEMPTS = 50;
const STARTUP_DELAY_MS = 50;

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() =>
        typeof address === "object" && address !== null
          ? resolve(address.port)
          : reject(new Error("Không lấy được cổng trống")),
      );
    });
  });
}

async function waitForRedis(port: number): Promise<void> {
  for (let attempt = 0; attempt < STARTUP_ATTEMPTS; attempt += 1) {
    const ready = await Bun.connect({
      hostname: "127.0.0.1",
      port,
      socket: { data: () => undefined },
    })
      .then((socket) => {
        socket.end();
        return true;
      })
      .catch(() => false);
    if (ready) {
      return;
    }
    await Bun.sleep(STARTUP_DELAY_MS);
  }
  throw new Error(`redis-server không chạy ở cổng ${port}`);
}

describe.skipIf(REDIS_SERVER === null)(
  "createRedisRateLimitStore với redis-server thật",
  () => {
    let port = 0;
    let redis: ReturnType<typeof Bun.spawn> | undefined;

    beforeAll(async () => {
      port = await findFreePort();
      redis = Bun.spawn(
        [
          REDIS_SERVER ?? "redis-server",
          "--port",
          String(port),
          "--save",
          "",
          "--appendonly",
          "no",
        ],
        { stdout: "ignore", stderr: "ignore" },
      );
      await waitForRedis(port);
    });

    afterAll(() => {
      redis?.kill();
    });

    test("đếm số lượt và đặt hạn sống cho key một lần", async () => {
      const store = createRedisRateLimitStore(`redis://127.0.0.1:${port}`);
      const key = `test:${crypto.randomUUID()}`;
      const first = await store.increment(key, 60_000);
      const second = await store.increment(key, 60_000);
      expect(first.count).toBe(1);
      expect(second.count).toBe(2);
      expect(second.resetAt - Date.now()).toBeGreaterThan(55_000);
      expect(second.resetAt - Date.now()).toBeLessThanOrEqual(60_000);
      expect(Math.abs(second.resetAt - first.resetAt)).toBeLessThan(1000);
      await store.close();
    });

    test("Redis sập thì báo lỗi nhanh, Redis chạy lại thì tự kết nối lại", async () => {
      const restartPort = await findFreePort();
      const spawn = () =>
        Bun.spawn(
          [
            REDIS_SERVER ?? "redis-server",
            "--port",
            String(restartPort),
            "--save",
            "",
            "--appendonly",
            "no",
          ],
          { stdout: "ignore", stderr: "ignore" },
        );
      let server = spawn();
      await waitForRedis(restartPort);
      const store = createRedisRateLimitStore(
        `redis://127.0.0.1:${restartPort}`,
        () => undefined,
      );
      expect((await store.increment("test:restart", 60_000)).count).toBe(1);

      server.kill();
      await server.exited;
      const started = Date.now();
      await expect(store.increment("test:restart", 60_000)).rejects.toThrow();
      expect(Date.now() - started).toBeLessThan(3000);

      server = spawn();
      await waitForRedis(restartPort);
      let count: number | undefined;
      for (let attempt = 0; attempt < 40 && count === undefined; attempt += 1) {
        await Bun.sleep(250);
        count = await store
          .increment("test:restart", 60_000)
          .then((hit) => hit.count)
          .catch(() => undefined);
      }
      expect(count).toBe(1);
      await store.close();
      server.kill();
    }, 20_000);

    test("key hết hạn thì đếm lại từ 1", async () => {
      const store = createRedisRateLimitStore(`redis://127.0.0.1:${port}`);
      const key = `test:${crypto.randomUUID()}`;
      await store.increment(key, 50);
      await store.increment(key, 50);
      await Bun.sleep(120);
      expect((await store.increment(key, 50)).count).toBe(1);
      await store.close();
    });
  },
);

describe("createRedisRateLimitStore khi Redis không chạy", () => {
  test("báo lỗi nhanh thay vì treo request", async () => {
    const port = await findFreePort();
    const errors: unknown[] = [];
    const store = createRedisRateLimitStore(
      `redis://127.0.0.1:${port}`,
      (error) => errors.push(error),
    );
    const started = Date.now();
    const error = await store
      .increment("test:down", 1000)
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(Error);
    expect(Date.now() - started).toBeLessThan(3000);
    await store.close().catch(() => undefined);
  });
});
