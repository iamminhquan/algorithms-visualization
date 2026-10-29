export const ASSISTANT_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 10 * 60 * 1000,
} as const;

const RATE_LIMIT_KEY_PREFIX = "assistant:rate-limit:";
const MAX_TRACKED_CLIENTS = 10_000;
const UNKNOWN_CLIENT = "unknown";
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

export interface IRateLimitHit {
  readonly count: number;
  readonly resetAt: number;
}

export interface IRateLimitStore {
  readonly increment: (key: string, windowMs: number) => Promise<IRateLimitHit>;
}

export type RateLimitDecision =
  | { readonly type: "allowed"; readonly remaining: number }
  | { readonly type: "limited"; readonly retryAfterSeconds: number };

export interface IRateLimiter {
  readonly check: (clientId: string) => Promise<RateLimitDecision>;
}

export interface IRateLimiterOptions {
  readonly store: IRateLimitStore;
  readonly fallback?: IRateLimitStore;
  readonly maxRequests?: number;
  readonly windowMs?: number;
  readonly now?: () => number;
  readonly onStoreError?: (error: unknown) => void;
}

export function createMemoryRateLimitStore(
  now: () => number = Date.now,
): IRateLimitStore {
  const entries = new Map<string, IRateLimitHit>();

  const removeExpired = (time: number) => {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= time) {
        entries.delete(key);
      }
    }
  };

  return {
    increment: async (key, windowMs) => {
      const time = now();
      if (entries.size >= MAX_TRACKED_CLIENTS) {
        removeExpired(time);
      }
      const current = entries.get(key);
      const next =
        current === undefined || current.resetAt <= time
          ? { count: 1, resetAt: time + windowMs }
          : { count: current.count + 1, resetAt: current.resetAt };
      entries.set(key, next);
      return next;
    },
  };
}

export function createRateLimiter({
  store,
  fallback,
  maxRequests = ASSISTANT_RATE_LIMIT.maxRequests,
  windowMs = ASSISTANT_RATE_LIMIT.windowMs,
  now = Date.now,
  onStoreError = (error) =>
    console.error("[assistant] Không đếm được lượt hỏi", error),
}: IRateLimiterOptions): IRateLimiter {
  const increment = async (key: string): Promise<IRateLimitHit | undefined> => {
    try {
      return await store.increment(key, windowMs);
    } catch (error) {
      onStoreError(error);
      return fallback?.increment(key, windowMs);
    }
  };

  return {
    check: async (clientId) => {
      const hit = await increment(`${RATE_LIMIT_KEY_PREFIX}${clientId}`);
      if (hit === undefined || hit.count <= maxRequests) {
        return {
          type: "allowed",
          remaining: Math.max(maxRequests - (hit?.count ?? 0), 0),
        };
      }
      return {
        type: "limited",
        retryAfterSeconds: Math.max(
          Math.ceil((hit.resetAt - now()) / MS_PER_SECOND),
          1,
        ),
      };
    },
  };
}

export function getClientId(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded !== undefined && forwarded !== "") {
    return forwarded;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  return realIp === undefined || realIp === "" ? UNKNOWN_CLIENT : realIp;
}

export function formatRetryAfter(seconds: number): string {
  return seconds < SECONDS_PER_MINUTE
    ? `${seconds} giây`
    : `${Math.ceil(seconds / SECONDS_PER_MINUTE)} phút`;
}
