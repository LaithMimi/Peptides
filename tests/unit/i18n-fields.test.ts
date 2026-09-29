import { describe, expect, it } from "vitest";
import { pick, pickOr } from "@/lib/i18n-fields";

describe("pick", () => {
  it("returns the requested language when present", () => {
    const row = { nameEn: "Rest", nameAr: "راحة" };
    expect(pick(row, "name", "en")).toBe("Rest");
    expect(pick(row, "name", "ar")).toBe("راحة");
  });

  it("falls back to the other language when missing or blank", () => {
    expect(pick({ nameEn: "Rest", nameAr: null }, "name", "ar")).toBe("Rest");
    expect(pick({ nameEn: "Rest", nameAr: "   " }, "name", "ar")).toBe("Rest");
    expect(pick({ nameEn: "", nameAr: "راحة" }, "name", "en")).toBe("راحة");
  });

  it("returns null or the fallback when neither language has a value", () => {
    expect(pick({ nameEn: null, nameAr: null }, "name", "en")).toBeNull();
    expect(pickOr({ nameEn: null, nameAr: null }, "name", "en", "-")).toBe("-");
  });

  it("treats unknown locales as English", () => {
    expect(pick({ nameEn: "Rest", nameAr: "راحة" }, "name", "fr")).toBe("Rest");
  });
});
