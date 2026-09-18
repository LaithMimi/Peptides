import { beforeEach, describe, expect, it } from "vitest";
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  checkRateLimit,
  __resetRateLimitForTests,
} from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimitForTests();
});

describe("checkRateLimit", () => {
  it("allows up to the limit and blocks the next request", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(checkRateLimit("1.1.1.1", 1000 + i)).toBe(true);
    }
    expect(checkRateLimit("1.1.1.1", 2000)).toBe(false);
  });

  it("tracks each IP separately", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("1.1.1.1", 1000);
    expect(checkRateLimit("2.2.2.2", 1000)).toBe(true);
  });

  it("allows requests again once the window has passed", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("1.1.1.1", 1000);
    expect(checkRateLimit("1.1.1.1", 1000 + RATE_LIMIT_WINDOW_MS + 1)).toBe(true);
  });
});
