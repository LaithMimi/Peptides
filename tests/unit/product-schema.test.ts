import { describe, expect, it } from "vitest";
import {
  MAX_PRODUCT_IMAGES,
  brandSchema,
  fieldErrors,
  formDataToObject,
  imageUrlSchema,
  isAllowedImageUrl,
  productSchema,
  settingsSchema,
} from "@/lib/schemas/admin";

const BRAND_ID = "3f0c3a3e-9a53-4c5b-9a3e-2c1f2b6d7a10";
const base = {
  brandId: BRAND_ID,
  nameEn: "TB-500",
  slug: "tb-500",
  status: "draft",
};

function errors(overrides: Record<string, unknown>) {
  const result = productSchema.safeParse({ ...base, ...overrides });
  return result.success ? null : fieldErrors(result.error);
}

describe("productSchema price", () => {
  it("treats an empty price as unpriced, which is valid", () => {
    for (const price of [undefined, "", "   "]) {
      const result = productSchema.safeParse({ ...base, price });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.price).toBeNull();
    }
  });

  it("converts a valid price to agorot", () => {
    const result = productSchema.safeParse({ ...base, price: "125.50" });
    expect(result.success && result.data.price).toBe(12550);
  });

  it("must be >= 1 agora and <= 10,000,000 agorot", () => {
    expect(errors({ price: "0.01" })).toBeNull();
    expect(errors({ price: "100000" })).toBeNull();
    expect(errors({ price: "0" })).toMatchObject({ price: "invalidPrice" });
    expect(errors({ price: "100000.01" })).toMatchObject({ price: "invalidPrice" });
  });

  it("rejects negative and non-numeric prices", () => {
    for (const price of ["-5", "abc", "1.234", "12,3,4", "1e3"]) {
      expect(errors({ price })).toMatchObject({ price: "invalidPrice" });
    }
  });
});

describe("productSchema other fields", () => {
  it("accepts a minimal valid product", () => {
    expect(errors({})).toBeNull();
  });

  it("validates the slug pattern (a-z, 0-9, hyphens, 2-60 chars)", () => {
    expect(errors({ slug: "a" })).toMatchObject({ slug: "invalidSlug" });
    expect(errors({ slug: "Has Space" })).toMatchObject({ slug: "invalidSlug" });
    expect(errors({ slug: "UPPER" })).toMatchObject({ slug: "invalidSlug" });
    expect(errors({ slug: "-lead" })).toMatchObject({ slug: "invalidSlug" });
    expect(errors({ slug: "a".repeat(61) })).toMatchObject({ slug: "invalidSlug" });
    expect(errors({ slug: "ok-slug-2" })).toBeNull();
  });

  it("requires an English name and a valid brand and status", () => {
    expect(errors({ nameEn: "" })).toMatchObject({ nameEn: "required" });
    expect(errors({ nameEn: "x".repeat(161) })).toMatchObject({ nameEn: "tooLong" });
    expect(errors({ brandId: "nope" })).toMatchObject({ brandId: "required" });
    expect(errors({ status: "live" })).toMatchObject({ status: "required" });
  });

  it("enforces text length limits", () => {
    expect(errors({ descriptionEn: "d".repeat(4001) })).toMatchObject({ descriptionEn: "tooLong" });
    expect(errors({ researchFocusEn: "r".repeat(301) })).toMatchObject({ researchFocusEn: "tooLong" });
    expect(errors({ usageEn: "u".repeat(2001) })).toMatchObject({ usageEn: "tooLong" });
    expect(errors({ researchFocusEn: "r".repeat(300) })).toBeNull();
  });

  it("turns blank optional text into null and reads checkboxes", () => {
    const result = productSchema.safeParse({ ...base, nameAr: "  ", isFeatured: "on" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameAr).toBeNull();
      expect(result.data.isFeatured).toBe(true);
    }
  });

  it("collects category ids", () => {
    const result = productSchema.safeParse({ ...base, categoryIds: [BRAND_ID] });
    expect(result.success && result.data.categoryIds).toEqual([BRAND_ID]);
    expect(errors({ categoryIds: ["not-a-uuid"] })).not.toBeNull();
  });
});

describe("image urls", () => {
  it("allows Vercel Blob https urls and local public paths only", () => {
    expect(isAllowedImageUrl("https://abc123.public.blob.vercel-storage.com/a-x.png")).toBe(true);
    expect(isAllowedImageUrl("/products/tb-500.jpeg")).toBe(true);
    expect(isAllowedImageUrl("http://abc.public.blob.vercel-storage.com/a.png")).toBe(false);
    expect(isAllowedImageUrl("https://evil.example.com/a.png")).toBe(false);
    expect(isAllowedImageUrl("//evil.example.com/a.png")).toBe(false);
    expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
    expect(imageUrlSchema.safeParse("").success).toBe(false);
    expect(MAX_PRODUCT_IMAGES).toBe(10);
  });
});

describe("brandSchema", () => {
  it("requires name and slug, accepts optional fields as blank", () => {
    expect(brandSchema.safeParse({ nameEn: "", slug: "x" }).success).toBe(false);
    const ok = brandSchema.safeParse({ nameEn: "PEP Lab", slug: "pep-lab", logoUrl: "", isActive: "on" });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.logoUrl).toBeNull();
      expect(ok.data.isActive).toBe(true);
    }
    const bad = brandSchema.safeParse({ nameEn: "A", slug: "a-b", logoUrl: "https://evil.example.com/x.png" });
    expect(bad.success).toBe(false);
    expect(brandSchema.safeParse({ nameEn: "A", slug: "a-b", descriptionEn: "d".repeat(2001) }).success).toBe(false);
  });
});

describe("settingsSchema", () => {
  const settings = {
    storeName: "Pep Club",
    deliveryFee: "",
    unpricedBehavior: "ask_price",
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
    maxLineQuantity: "10",
  };

  it("defaults the delivery fee to free and normalizes the WhatsApp number", () => {
    const result = settingsSchema.safeParse({ ...settings, whatsappNumber: "+972 50-123 4567" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deliveryFee).toBe(0);
      expect(result.data.whatsappNumber).toBe("972501234567");
    }
  });

  it("validates fee, whatsapp, email, locales and quantity", () => {
    const err = (o: Record<string, unknown>) => {
      const r = settingsSchema.safeParse({ ...settings, ...o });
      return r.success ? null : fieldErrors(r.error);
    };
    expect(err({ deliveryFee: "-1" })).toMatchObject({ deliveryFee: "invalidPrice" });
    expect(err({ deliveryFee: "25" })).toBeNull();
    expect(err({ whatsappNumber: "abc" })).toMatchObject({ whatsappNumber: "invalidWhatsapp" });
    expect(err({ email: "nope" })).toMatchObject({ email: "invalidEmail" });
    expect(err({ supportedLocales: [] })).toMatchObject({ supportedLocales: "required" });
    expect(err({ supportedLocales: ["ar"], defaultLocale: "en" })).toMatchObject({
      defaultLocale: "defaultNotSupported",
    });
    expect(err({ maxLineQuantity: "0" })).not.toBeNull();
    expect(err({ maxLineQuantity: "101" })).not.toBeNull();
  });
});

describe("formDataToObject", () => {
  it("reads single values and arrays, skipping Next.js internals", () => {
    const fd = new FormData();
    fd.append("nameEn", "x");
    fd.append("categoryIds", "a");
    fd.append("categoryIds", "b");
    fd.append("$ACTION_ID_abc", "1");
    expect(formDataToObject(fd, ["categoryIds", "other"])).toEqual({
      nameEn: "x",
      categoryIds: ["a", "b"],
      other: [],
    });
  });
});
