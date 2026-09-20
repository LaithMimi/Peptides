import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SESSION_TTL_SECONDS,
  createSession,
  readSession,
} from "@/lib/session";

const PHONE = "+14155552671";
const TTL_MS = SESSION_TTL_SECONDS * 1000;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("session", () => {
  it("reads back the phone from a fresh session", () => {
    const { value } = createSession(PHONE);
    expect(readSession(value)).toEqual({ phone: PHONE });
  });

  it("lasts 30 days and is expired at the boundary", () => {
    const { value } = createSession(PHONE, 0);
    expect(readSession(value, TTL_MS - 1000)).toEqual({ phone: PHONE });
    expect(readSession(value, TTL_MS)).toBeNull();
    expect(readSession(value, TTL_MS + 1000)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const { value } = createSession(PHONE);
    const [, signature] = value.split(".");
    const forged = Buffer.from(
      JSON.stringify({ p: "+14155552672", exp: 9_999_999_999 })
    ).toString("base64url");
    expect(readSession(`${forged}.${signature}`)).toBeNull();
  });

  it("rejects a tampered signature and malformed values", () => {
    const { value } = createSession(PHONE);
    expect(readSession(value + "x")).toBeNull();
    expect(readSession("garbage")).toBeNull();
    expect(readSession("")).toBeNull();
    expect(readSession(undefined)).toBeNull();
    expect(readSession("a.b.c")).toBeNull();
  });

  it("rejects a session signed with a different secret", () => {
    vi.stubEnv("PHONE_TOKEN_SECRET", "secret-one");
    const { value } = createSession(PHONE);
    vi.stubEnv("PHONE_TOKEN_SECRET", "secret-two");
    expect(readSession(value)).toBeNull();
  });

  it("refuses to sign or accept without a secret in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PHONE_TOKEN_SECRET", "");
    expect(() => createSession(PHONE)).toThrow();
    expect(readSession("a.b")).toBeNull();
  });
});
