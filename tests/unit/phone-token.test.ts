import { afterEach, describe, expect, it, vi } from "vitest";
import { signPhoneToken, verifyPhoneToken } from "@/lib/phone-token";

const PHONE = "+14155552671";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("phone token", () => {
  it("accepts a fresh token for the same phone", () => {
    const { token } = signPhoneToken(PHONE);
    expect(verifyPhoneToken(token, PHONE)).toBe(true);
  });

  it("rejects a token for a different phone", () => {
    const { token } = signPhoneToken(PHONE);
    expect(verifyPhoneToken(token, "+14155552672")).toBe(false);
  });

  it("rejects an expired token", () => {
    const { token } = signPhoneToken(PHONE, 0);
    expect(verifyPhoneToken(token, PHONE, 31 * 60 * 1000)).toBe(false);
    expect(verifyPhoneToken(token, PHONE, 29 * 60 * 1000)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const { token } = signPhoneToken(PHONE);
    const [, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ p: "+14155552672", exp: 9_999_999_999 })
    ).toString("base64url");
    expect(verifyPhoneToken(`${forged}.${signature}`, "+14155552672")).toBe(
      false
    );
  });

  it("rejects a tampered signature and malformed tokens", () => {
    const { token } = signPhoneToken(PHONE);
    expect(verifyPhoneToken(token + "x", PHONE)).toBe(false);
    expect(verifyPhoneToken("garbage", PHONE)).toBe(false);
    expect(verifyPhoneToken("", PHONE)).toBe(false);
    expect(verifyPhoneToken("a.b.c", PHONE)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    vi.stubEnv("PHONE_TOKEN_SECRET", "secret-one");
    const { token } = signPhoneToken(PHONE);
    vi.stubEnv("PHONE_TOKEN_SECRET", "secret-two");
    expect(verifyPhoneToken(token, PHONE)).toBe(false);
  });

  it("refuses to sign or accept without a secret in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PHONE_TOKEN_SECRET", "");
    expect(() => signPhoneToken(PHONE)).toThrow();
    expect(verifyPhoneToken("a.b", PHONE)).toBe(false);
  });
});
