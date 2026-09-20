import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "pepclub_session";
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEV_SECRET = "dev-only-phone-token-secret";

function getSecret(): string {
  const secret = process.env.PHONE_TOKEN_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("PHONE_TOKEN_SECRET is required in production");
  }
  return DEV_SECRET;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Signs a 30-day session proving this browser verified `phone`. */
export function createSession(
  phone: string,
  now: number = Date.now()
): { value: string; expiresAt: string } {
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ p: phone, exp })).toString(
    "base64url"
  );
  return {
    value: `${payload}.${sign(payload, getSecret())}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

/** Returns the verified phone, or null for anything absent, forged or expired. */
export function readSession(
  value: string | undefined | null,
  now: number = Date.now()
): { phone: string } | null {
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
    if (
      typeof data.p === "string" &&
      typeof data.exp === "number" &&
      data.exp > Math.floor(now / 1000)
    ) {
      return { phone: data.p };
    }
    return null;
  } catch {
    return null;
  }
}

/** The verified phone from the request's session cookie, or null. */
export async function getSessionPhone(): Promise<string | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return readSession(value)?.phone ?? null;
}
