import { beforeEach, describe, expect, it } from "vitest";
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  checkRateLimit,
  otpLimits,
  __resetRateLimitForTests,
} from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimitForTests();
});

describe("checkRateLimit", () => {
  it("allows up to the limit and blocks the next request", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(checkRateLimit("1.1.1.1", {}, 1000 + i)).toBe(true);
    }
    expect(checkRateLimit("1.1.1.1", {}, 2000)).toBe(false);
  });

  it("tracks each key separately", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("1.1.1.1", {}, 1000);
    expect(checkRateLimit("2.2.2.2", {}, 1000)).toBe(true);
  });

  it("allows requests again once the window has passed", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("1.1.1.1", {}, 1000);
    expect(
      checkRateLimit("1.1.1.1", {}, 1000 + RATE_LIMIT_WINDOW_MS + 1)
    ).toBe(true);
  });

  it("honors a custom max and window per key", () => {
    const opts = { max: 2, windowMs: 1000 };
    expect(checkRateLimit("k", opts, 0)).toBe(true);
    expect(checkRateLimit("k", opts, 1)).toBe(true);
    expect(checkRateLimit("k", opts, 2)).toBe(false);
    expect(checkRateLimit("k", opts, 1001)).toBe(true);
  });

  it("keeps a longer-window key blocked while a shorter one has expired", () => {
    const short = { max: 1, windowMs: 1000 };
    const long = { max: 1, windowMs: 60_000 };
    checkRateLimit("short", short, 0);
    checkRateLimit("long", long, 0);
    expect(checkRateLimit("short", short, 5000)).toBe(true);
    expect(checkRateLimit("long", long, 5000)).toBe(false);
  });
});

describe("otpLimits", () => {
  it("defaults to 3 sends per IP, 3 per phone, 10 checks per IP", () => {
    expect(otpLimits.sendPerIp().max).toBe(3);
    expect(otpLimits.sendPerPhone().max).toBe(3);
    expect(otpLimits.checkPerIp().max).toBe(10);
  });
});
