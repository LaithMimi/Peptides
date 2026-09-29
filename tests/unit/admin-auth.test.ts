// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => new Headers(),
}));

import { resetTestDb, useTestDb } from "./helpers/test-db";
import type { Db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  LOCK_MS,
  authenticate,
  createSessionValue,
  getCurrentAdmin,
  hashPassword,
  readSessionValue,
  startAdminSession,
  verifyPassword,
  withAdmin,
} from "@/lib/admin-auth";

let db: Db;
let userId: string;
const PASSWORD = "correct horse battery";
let ipCounter = 0;
const ip = () => `198.51.100.${++ipCounter}`;

beforeEach(async () => {
  jar.clear();
  db = await useTestDb();
  const [user] = await db
    .insert(adminUsers)
    .values({ email: "owner@example.com", passwordHash: await hashPassword(PASSWORD) })
    .returning();
  userId = user.id;
});
afterEach(() => resetTestDb());

describe("password hashing", () => {
  it("verifies the right password and rejects others", async () => {
    const hash = await hashPassword("s3cret-password!");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("s3cret-password!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("uses a fresh salt each time and rejects malformed hashes", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "scrypt$1$2$3")).toBe(false);
  });
});

describe("session cookie value", () => {
  const now = 1_800_000_000_000;

  it("round-trips a valid session", () => {
    expect(readSessionValue(createSessionValue("user-1", now), now + 1000)).toBe("user-1");
  });

  it("rejects an expired session", () => {
    const value = createSessionValue("user-1", now);
    expect(readSessionValue(value, now + (ADMIN_SESSION_SECONDS + 1) * 1000)).toBeNull();
  });

  it("rejects forged, tampered and malformed values", () => {
    const value = createSessionValue("user-1", now);
    const [payload, signature] = value.split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ u: "admin", exp: 9_999_999_999 })).toString("base64url");
    expect(readSessionValue(`${forgedPayload}.${signature}`, now)).toBeNull();
    expect(readSessionValue(`${payload}.AAAA`, now)).toBeNull();
    expect(readSessionValue("garbage", now)).toBeNull();
    expect(readSessionValue(undefined, now)).toBeNull();
    expect(readSessionValue(null, now)).toBeNull();
  });
});

describe("authenticate", () => {
  it("signs in with the right credentials (email is case-insensitive)", async () => {
    const result = await authenticate("Owner@Example.com ", PASSWORD, ip());
    expect(result).toMatchObject({ ok: true, user: { email: "owner@example.com" } });
  });

  it("gives the same generic error for a wrong password and an unknown email", async () => {
    expect(await authenticate("owner@example.com", "nope", ip())).toEqual({
      ok: false,
      code: "INVALID_CREDENTIALS",
    });
    expect(await authenticate("nobody@example.com", "nope", ip())).toEqual({
      ok: false,
      code: "INVALID_CREDENTIALS",
    });
  });

  it("locks the account for 15 minutes after 5 failures, even for the right password", async () => {
    const now = 2_000_000_000_000;
    for (let i = 0; i < 4; i++) {
      expect(await authenticate("owner@example.com", "bad", ip(), now)).toMatchObject({
        code: "INVALID_CREDENTIALS",
      });
    }
    expect(await authenticate("owner@example.com", "bad", ip(), now)).toMatchObject({ code: "LOCKED" });
    expect(await authenticate("owner@example.com", PASSWORD, ip(), now + 60_000)).toMatchObject({
      code: "LOCKED",
    });
    // After the lock expires the right password works again.
    expect(await authenticate("owner@example.com", PASSWORD, ip(), now + LOCK_MS + 1000)).toMatchObject({
      ok: true,
    });
  });

  it("resets the failure counter after a successful sign-in", async () => {
    await authenticate("owner@example.com", "bad", ip());
    await authenticate("owner@example.com", "bad", ip());
    await authenticate("owner@example.com", PASSWORD, ip());
    const [user] = await db.select().from(adminUsers);
    expect(user.failedAttempts).toBe(0);
    expect(user.lastLoginAt).toBeInstanceOf(Date);
  });

  it("rate limits sign-in attempts from one IP", async () => {
    const same = "203.0.113.50";
    let last;
    for (let i = 0; i < 11; i++) last = await authenticate("nobody@example.com", "x", same);
    expect(last).toEqual({ ok: false, code: "RATE_LIMITED" });
  });
});

describe("withAdmin / getCurrentAdmin", () => {
  it("denies without a session cookie and does not run the callback", async () => {
    const fn = vi.fn(async () => ({ ok: true as const }));
    expect(await withAdmin(fn)).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(fn).not.toHaveBeenCalled();
  });

  it("allows a valid session and reports the admin", async () => {
    await startAdminSession(userId);
    expect(jar.has(ADMIN_COOKIE)).toBe(true);
    expect(await getCurrentAdmin()).toEqual({ id: userId, email: "owner@example.com" });
    const fn = vi.fn(async () => ({ ok: true as const }));
    expect(await withAdmin(fn)).toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("denies a forged cookie and a session for a deleted user", async () => {
    jar.set(ADMIN_COOKIE, "forged.value");
    expect(await getCurrentAdmin()).toBeNull();
    await startAdminSession(userId);
    await db.delete(adminUsers);
    expect(await getCurrentAdmin()).toBeNull();
  });
});
