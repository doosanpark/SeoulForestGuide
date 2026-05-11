// 인메모리 rate limit + 일일 호출 캡.
// 단일 프로세스 가정 — 멀티 인스턴스 배포 시 @upstash/ratelimit 등으로 교체.

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { allowed: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }
  if (b.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: b.resetAt };
  }
  b.count++;
  return { allowed: true, remaining: limit - b.count, resetAt: b.resetAt };
}

// Daily global call cap (cost safety).
let dailyKey = todayKey();
let dailyCount = 0;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function takeDailyCap(limit: number): boolean {
  const today = todayKey();
  if (today !== dailyKey) {
    dailyKey = today;
    dailyCount = 0;
  }
  if (dailyCount >= limit) return false;
  dailyCount++;
  return true;
}

export function readDailyUsage(): { count: number; limit: number } {
  return { count: dailyCount, limit: -1 };
}
