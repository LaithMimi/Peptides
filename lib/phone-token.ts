import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = 30 * 60;
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

export function signPhoneToken(
  phone: string,
  now: number = Date.now()
): { token: string; expiresAt: string } {
  const exp = Math.floor(now / 1000) + TOKEN_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ p: phone, exp })).toString(
    "base64url"
  );
  return {
    token: `${payload}.${sign(payload, getSecret())}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

export function verifyPhoneToken(
  token: string,
  phone: string,
  now: number = Date.now()
): boolean {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;

  let expected: string;
  try {
    expected = sign(payload, getSecret());
  } catch {
    return false;
  }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      typeof data.p === "string" &&
      typeof data.exp === "number" &&
      data.p === phone &&
      data.exp > Math.floor(now / 1000)
    );
  } catch {
    return false;
  }
}
