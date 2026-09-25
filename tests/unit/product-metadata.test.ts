import { describe, expect, it } from "vitest";
import { excerpt, pageMetadata } from "@/lib/seo";

describe("pageMetadata", () => {
  it("builds title, description, canonical, language alternates and Open Graph", () => {
    const meta = pageMetadata({
      title: "TB-500 — PEP Lab",
      description: "A research peptide.",
      path: "/products/pep-lab/tb-500",
      locale: "ar",
      image: "/products/tb-500.jpeg",
    });
    expect(meta.title).toBe("TB-500 — PEP Lab");
    expect(meta.description).toBe("A research peptide.");
    expect(meta.alternates?.canonical).toMatch(/\/ar\/products\/pep-lab\/tb-500$/);
    expect(meta.alternates?.languages).toMatchObject({
      en: expect.stringMatching(/\/en\/products\/pep-lab\/tb-500$/),
      ar: expect.stringMatching(/\/ar\/products\/pep-lab\/tb-500$/),
    });
    expect(meta.openGraph).toMatchObject({
      title: "TB-500 — PEP Lab",
      locale: "ar",
      images: [{ url: expect.stringMatching(/^https?:\/\/.+\/products\/tb-500\.jpeg$/) }],
    });
    expect(meta.robots).toBeUndefined();
  });

  it("marks noindex pages", () => {
    const meta = pageMetadata({ title: "Order", path: "/order/PC-1", locale: "en", noindex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("keeps absolute image URLs as they are", () => {
    const meta = pageMetadata({
      title: "x",
      path: "",
      locale: "en",
      image: "https://abc.public.blob.vercel-storage.com/a.png",
    });
    expect(meta.openGraph?.images).toEqual([
      { url: "https://abc.public.blob.vercel-storage.com/a.png" },
    ]);
  });
});

describe("excerpt", () => {
  it("collapses whitespace and trims to length with an ellipsis", () => {
    expect(excerpt("a  b\n c")).toBe("a b c");
    const long = "word ".repeat(100);
    const out = excerpt(long, 50)!;
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns undefined for empty input", () => {
    expect(excerpt(null)).toBeUndefined();
    expect(excerpt("")).toBeUndefined();
  });
});
