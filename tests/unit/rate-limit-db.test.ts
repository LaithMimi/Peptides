// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetTestDb, useTestDb } from "./helpers/test-db";
import { checkLimit } from "@/lib/rate-limit-db";

beforeEach(async () => {
  await useTestDb();
});
afterEach(() => resetTestDb());

describe("checkLimit", () => {
  const opts = { max: 3, windowMs: 60_000 };

  it("allows up to max hits then blocks", async () => {
    const now = 1_000_000_000_000;
    expect(await checkLimit("k", opts, now)).toBe(true);
    expect(await checkLimit("k", opts, now)).toBe(true);
    expect(await checkLimit("k", opts, now)).toBe(true);
    expect(await checkLimit("k", opts, now)).toBe(false);
  });

  it("tracks keys independently and resets in a new window", async () => {
    const now = 1_000_000_000_000;
    for (let i = 0; i < 4; i++) await checkLimit("a", opts, now);
    expect(await checkLimit("b", opts, now)).toBe(true);
    expect(await checkLimit("a", opts, now + 61_000)).toBe(true);
  });
});
