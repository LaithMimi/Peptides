import { describe, expect, it } from "vitest";
import { parsePhone } from "@/lib/phone";

describe("parsePhone", () => {
  it("normalizes a valid international number to E.164", () => {
    expect(parsePhone("+1 (415) 555-2671")).toBe("+14155552671");
    expect(parsePhone("  +962 7 9012 3456 ")).toBe("+962790123456");
  });

  it("rejects a number without a leading +", () => {
    expect(parsePhone("4155552671")).toBeNull();
  });

  it("rejects obviously invalid numbers", () => {
    expect(parsePhone("+1")).toBeNull();
    expect(parsePhone("+123")).toBeNull();
    expect(parsePhone("not a phone")).toBeNull();
    expect(parsePhone("")).toBeNull();
  });
});
