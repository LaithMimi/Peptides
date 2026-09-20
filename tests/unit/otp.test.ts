import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkVerification, startVerification } from "@/lib/otp";

const PHONE = "+14155552671";

function stubTwilioEnv() {
  vi.stubEnv("TWILIO_ACCOUNT_SID", "ACtest");
  vi.stubEnv("TWILIO_AUTH_TOKEN", "token");
  vi.stubEnv("TWILIO_VERIFY_SERVICE_SID", "VAtest");
}

function clearTwilioEnv() {
  vi.stubEnv("TWILIO_ACCOUNT_SID", "");
  vi.stubEnv("TWILIO_AUTH_TOKEN", "");
  vi.stubEnv("TWILIO_VERIFY_SERVICE_SID", "");
}

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("dev fallback (no Twilio, not production)", () => {
  it("accepts only 000000", async () => {
    vi.stubEnv("NODE_ENV", "development");
    clearTwilioEnv();
    expect(await startVerification(PHONE, "en")).toBe("ok");
    expect(await checkVerification(PHONE, "000000")).toBe("ok");
    expect(await checkVerification(PHONE, "123456")).toBe("invalid");
  });
});

describe("production without Twilio configured", () => {
  it("fails closed and never accepts 000000", async () => {
    vi.stubEnv("NODE_ENV", "production");
    clearTwilioEnv();
    expect(await startVerification(PHONE, "en")).toBe("error");
    expect(await checkVerification(PHONE, "000000")).toBe("error");
  });

  it("fails closed when only some Twilio variables are set", async () => {
    vi.stubEnv("NODE_ENV", "development");
    clearTwilioEnv();
    vi.stubEnv("TWILIO_ACCOUNT_SID", "ACtest");
    expect(await startVerification(PHONE, "en")).toBe("error");
    expect(await checkVerification(PHONE, "000000")).toBe("error");
  });
});

describe("Twilio Verify calls", () => {
  it("sends a start request with the SMS channel and locale", async () => {
    vi.stubEnv("NODE_ENV", "production");
    stubTwilioEnv();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchMock);

    expect(await startVerification(PHONE, "ar")).toBe("ok");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://verify.twilio.com/v2/Services/VAtest/Verifications");
    const body = init.body as URLSearchParams;
    expect(body.get("To")).toBe(PHONE);
    expect(body.get("Channel")).toBe("sms");
    expect(body.get("Locale")).toBe("ar");
    expect(init.headers.Authorization).toMatch(/^Basic /);
  });

  it("maps start failures to error", async () => {
    vi.stubEnv("NODE_ENV", "production");
    stubTwilioEnv();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    expect(await startVerification(PHONE, "en")).toBe("error");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await startVerification(PHONE, "en")).toBe("error");
  });

  it("maps check results: approved, pending, expired, error", async () => {
    vi.stubEnv("NODE_ENV", "production");
    stubTwilioEnv();
    const respond = (res: object) =>
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res));

    respond({ ok: true, status: 200, json: async () => ({ status: "approved" }) });
    expect(await checkVerification(PHONE, "123456")).toBe("ok");

    respond({ ok: true, status: 200, json: async () => ({ status: "pending" }) });
    expect(await checkVerification(PHONE, "123456")).toBe("invalid");

    respond({ ok: false, status: 404 });
    expect(await checkVerification(PHONE, "123456")).toBe("expired");

    respond({ ok: false, status: 500 });
    expect(await checkVerification(PHONE, "123456")).toBe("error");
  });
});
