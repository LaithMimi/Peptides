export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

// Best-effort: state is per server instance and resets on cold start.
const hits = new Map<string, number[]>();

/** Returns true if the request is allowed, false if the IP is over the limit. */
export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  for (const [key, timestamps] of hits) {
    const recent = timestamps.filter((t) => t > windowStart);
    if (recent.length === 0) hits.delete(key);
    else if (recent.length !== timestamps.length) hits.set(key, recent);
  }

  const recent = hits.get(ip) ?? [];
  if (recent.length >= RATE_LIMIT_MAX) return false;
  hits.set(ip, [...recent, now]);
  return true;
}

/** Test-only: clear limiter state between test cases. */
export function __resetRateLimitForTests() {
  hits.clear();
}
