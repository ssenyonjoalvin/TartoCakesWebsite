import { headers } from "next/headers";

/**
 * Minimal fixed-window rate limiter kept in memory.
 *
 * Limitation: on serverless hosting (Vercel) each function instance has its
 * own memory, so this slows down a single noisy client rather than enforcing
 * a global limit. Swap the Map for Redis/Upstash if spam becomes a problem.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function clientIp() {
  const list = await headers();
  return (
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    "unknown"
  );
}

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Opportunistic cleanup so the Map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
