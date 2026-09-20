import { describe, expect, it } from "vitest";
import { LEGAL_SLUGS, getLegalDoc } from "@/lib/legal-content";

describe("legal content", () => {
  it.each(LEGAL_SLUGS)("%s has the same section structure in en and ar", (slug) => {
    const en = getLegalDoc(slug, "en");
    const ar = getLegalDoc(slug, "ar");
    expect(ar.sections.length).toBe(en.sections.length);
    en.sections.forEach((section, i) => {
      expect(ar.sections[i].paragraphs.length).toBe(section.paragraphs.length);
      expect(section.heading).not.toBe("");
    });
  });

  it("never states a price or takes payment on the site", () => {
    const text = LEGAL_SLUGS.map((s) => JSON.stringify(getLegalDoc(s, "en"))).join(" ");
    expect(text).not.toMatch(/[$€£]\s?\d/);
  });
});
