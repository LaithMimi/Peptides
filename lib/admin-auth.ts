import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { checkLimit, limits } from "@/lib/rate-limit-db";

// Admin authentication: email + password (scrypt) and a signed, HttpOnly
// session cookie. There is no public sign-up; admins are created with
// `npm run admin:create`. Every admin page and Server Action re-checks the
// session (a layout alone does not protect a Server Action).

export const ADMIN_COOKIE = "pepclub_admin";
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MS = 15 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 12;

const DEV_SECRET = "dev-only-admin-session-secret";

type ScryptFn = (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number }
) => Promise<Buffer>;
const scrypt = promisify(scryptCallback) as unknown as ScryptFn;

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  try {
    const expected = Buffer.from(keyB64, "base64");
    const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;
/** Compared against when the email is unknown, so timing does not reveal whether it exists. */
const getDummyHash = () => (dummyHash ??= hashPassword("not-a-real-password"));

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production");
  }
  return DEV_SECRET;
}

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export function createSessionValue(userId: string, now: number = Date.now()): string {
  const exp = Math.floor(now / 1000) + ADMIN_SESSION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ u: userId, exp })).toString("base64url");
  return `${payload}.${sign(payload, getSecret())}`;
}

/** The admin user id in a valid, unexpired session value, else null. */
export function readSessionValue(
  value: string | undefined | null,
  now: number = Date.now()
): string | null {
  if (typeof value !== "string") return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  let expected: string;
  try {
    expected = sign(payload, getSecret());
  } catch {
    return null;
  }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data?.u !== "string" || typeof data?.exp !== "number") return null;
    if (data.exp <= Math.floor(now / 1000)) return null;
    return data.u;
  } catch {
    return null;
  }
}

export interface AdminUser {
  id: string;
  email: string;
}

export type AuthResult =
  | { ok: true; user: AdminUser }
  | { ok: false; code: "INVALID_CREDENTIALS" | "LOCKED" | "RATE_LIMITED" };

const hashIp = (ip: string) => createHash("sha256").update(ip).digest("hex").slice(0, 32);

/**
 * Checks email + password. Repeated failures lock the account: after 5 wrong
 * passwords sign-in is refused for 15 minutes. Per-IP attempts are limited too.
 * The error for a wrong email and a wrong password is the same.
 */
export async function authenticate(
  email: string,
  password: string,
  ip: string,
  now: number = Date.now()
): Promise<AuthResult> {
  const db = await getDb();
  if (!(await checkLimit(`login:ip:${hashIp(ip)}`, limits.loginPerIp(), now))) {
    return { ok: false, code: "RATE_LIMITED" };
  }

  const normalized = email.trim().toLowerCase();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, normalized));

  if (!user) {
    await verifyPassword(password, await getDummyHash());
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }
  if (user.lockedUntil && user.lockedUntil.getTime() > now) {
    return { ok: false, code: "LOCKED" };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedAttempts + 1;
    const lock = failed >= MAX_FAILED_ATTEMPTS;
    await db
      .update(adminUsers)
      .set({
        failedAttempts: lock ? 0 : failed,
        lockedUntil: lock ? new Date(now + LOCK_MS) : null,
      })
      .where(eq(adminUsers.id, user.id));
    return { ok: false, code: lock ? "LOCKED" : "INVALID_CREDENTIALS" };
  }

  await db
    .update(adminUsers)
    .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date(now) })
    .where(eq(adminUsers.id, user.id));
  return { ok: true, user: { id: user.id, email: user.email } };
}

export async function startAdminSession(userId: string): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** The signed-in admin (the user must still exist), or null. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const userId = readSessionValue((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!userId) return null;
  const db = await getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, userId));
  return user ? { id: user.id, email: user.email } : null;
}

export type Unauthorized = { ok: false; code: "UNAUTHORIZED" };

/**
 * Runs an admin mutation only for a signed-in admin. Every admin Server Action
 * goes through this first; without a valid session nothing runs.
 */
export async function withAdmin<T>(
  fn: (admin: AdminUser) => Promise<T>
): Promise<T | Unauthorized> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, code: "UNAUTHORIZED" };
  return fn(admin);
}

