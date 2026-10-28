import { createClient } from "redis";
import type { IRateLimitStore } from "./rate-limit";

const CONNECT_TIMEOUT_MS = 2000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const RECONNECT_STEP_MS = 500;

export interface IRedisRateLimitStore extends IRateLimitStore {
  readonly close: () => Promise<void>;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function createRedisRateLimitStore(
  url: string,
  onError: (error: unknown) => void = (error) =>
    console.error("[assistant] Redis lỗi", error),
): IRedisRateLimitStore {
  const client = createClient({
    url,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: CONNECT_TIMEOUT_MS,
      reconnectStrategy: (retries) =>
        Math.min((retries + 1) * RECONNECT_STEP_MS, MAX_RECONNECT_DELAY_MS),
    },
  });
  client.on("error", onError);

  let connecting: Promise<unknown> | undefined;
  const ensureConnected = async () => {
    if (client.isReady) {
      return;
    }
    if (!client.isOpen) {
      connecting = client.connect();
      connecting.catch(onError);
    }
    await withTimeout(
      connecting ?? Promise.resolve(),
      CONNECT_TIMEOUT_MS,
      `Không kết nối được Redis sau ${CONNECT_TIMEOUT_MS}ms`,
    );
  };

  return {
    increment: async (key, windowMs) => {
      await ensureConnected();
      const [count, , ttl] = await client
        .multi()
        .incr(key)
        .pExpire(key, windowMs, "NX")
        .pTTL(key)
        .execTyped();
      return {
        count,
        resetAt: Date.now() + (ttl > 0 ? ttl : windowMs),
      };
    },
    close: async () => {
      if (client.isReady) {
        await client.close();
      } else if (client.isOpen) {
        client.destroy();
      }
    },
  };
}
