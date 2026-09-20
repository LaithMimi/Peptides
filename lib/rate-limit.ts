export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

interface RateLimitOptions {
  max?: number;
  windowMs?: number;
}

function envInt(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export const submitLimit = () => ({
  max: envInt("SUBMIT_LIMIT_PER_IP", RATE_LIMIT_MAX),
  windowMs: RATE_LIMIT_WINDOW_MS,
});

export const otpLimits = {
  sendPerIp: () => ({
    max: envInt("OTP_SEND_LIMIT_PER_IP", 3),
    windowMs: 10 * 60 * 1000,
  }),
  sendPerPhone: () => ({
    max: envInt("OTP_SEND_LIMIT_PER_PHONE", 3),
    windowMs: 60 * 60 * 1000,
  }),
  checkPerIp: () => ({
    max: envInt("OTP_CHECK_LIMIT_PER_IP", 10),
    windowMs: 10 * 60 * 1000,
  }),
};

// Best-effort: state is per server instance and resets on cold start.
const hits = new Map<string, { windowMs: number; timestamps: number[] }>();

/** Returns true if the request is allowed, false if the key is over its limit. */
export function checkRateLimit(
  key: string,
  { max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS }: RateLimitOptions = {},
  now: number = Date.now()
): boolean {
  for (const [k, entry] of hits) {
    const recent = entry.timestamps.filter((t) => t > now - entry.windowMs);
    if (recent.length === 0) hits.delete(k);
    else if (recent.length !== entry.timestamps.length) {
      hits.set(k, { windowMs: entry.windowMs, timestamps: recent });
    }
  }

  const recent = hits.get(key)?.timestamps ?? [];
  if (recent.length >= max) return false;
  hits.set(key, { windowMs, timestamps: [...recent, now] });
  return true;
}

/** Test-only: clear limiter state between test cases. */
export function __resetRateLimitForTests() {
  hits.clear();
}
