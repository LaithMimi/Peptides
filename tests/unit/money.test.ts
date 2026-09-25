import { describe, expect, it } from "vitest";
import { formatMoney, fromMinor, toMinor } from "@/lib/money";

describe("money", () => {
  it("formats agorot as shekels in both locales", () => {
    expect(formatMoney(12500, "en")).toBe("₪125");
    expect(formatMoney(12550, "en")).toBe("₪125.50");
    expect(formatMoney(12550, "ar")).toContain("125.50");
    expect(formatMoney(12550, "ar")).toContain("₪");
  });

  it("parses admin input into agorot", () => {
    expect(toMinor("125")).toBe(12500);
    expect(toMinor("125.5")).toBe(12550);
    expect(toMinor("125,50")).toBe(12550);
    expect(toMinor("0.99")).toBe(99);
  });

  it("rejects invalid input", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1e3", "12 5"]) {
      expect(toMinor(bad)).toBeNull();
    }
  });

  it("round-trips to a form string", () => {
    expect(fromMinor(12550)).toBe("125.50");
  });
});
