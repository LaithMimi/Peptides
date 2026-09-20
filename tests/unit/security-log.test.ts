import { afterEach, describe, expect, it, vi } from "vitest";
import { logSecurityEvent, maskPhone } from "@/lib/security-log";

describe("security log", () => {
  afterEach(() => vi.restoreAllMocks());

  it("masks all but the prefix and last two digits", () => {
    expect(maskPhone("+962791234567")).toBe("+962***67");
    expect(maskPhone("123")).toBe("***");
  });

  it("emits one JSON line tagged as a security event", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logSecurityEvent("otp_verify_failed", { ip: "1.2.3.4", reason: "invalid" });
    const line = JSON.parse(spy.mock.calls[0][0] as string);
    expect(line).toMatchObject({
      type: "security",
      event: "otp_verify_failed",
      ip: "1.2.3.4",
      reason: "invalid",
    });
    expect(typeof line.at).toBe("string");
  });
});
