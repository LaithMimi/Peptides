import { z } from "zod";
import { MAX_PRICE_MINOR, toMinor } from "@/lib/money";
import { PAGE_SLUGS } from "@/lib/db/schema";

// Error `message` values are short codes shown through translated/plain
// messages (required, invalidSlug, invalidPrice, tooLong, ...), never raw text.

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slug = z
  .string()
  .trim()
  .min(2, { message: "invalidSlug" })
  .max(60, { message: "invalidSlug" })
  .regex(SLUG_PATTERN, { message: "invalidSlug" });

const requiredText = (max: number) =>
  z.string().trim().min(1, { message: "required" }).max(max, { message: "tooLong" });

/** Optional text: blank becomes null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: "tooLong" })
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const checkbox = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((v) => v === true || v === "on" || v === "true");

const optionalUrl = z
  .string()
  .trim()
  .max(500, { message: "tooLong" })
  .optional()
  .nullable()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isAllowedImageUrl(v), { message: "invalidImageUrl" });

/** Image URLs must be on Vercel Blob or be a file served from this site's /public. */
export function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return /^\/[\w./-]+$/.test(url);
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export const brandSchema = z.object({
  id: z.string().uuid().optional(),
  nameEn: requiredText(120),
  nameAr: optionalText(120),
  slug,
  logoUrl: optionalUrl,
  descriptionEn: optionalText(2000),
  descriptionAr: optionalText(2000),
  isActive: checkbox,
});

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  nameEn: requiredText(120),
  nameAr: optionalText(120),
  slug,
  descriptionEn: optionalText(500),
  descriptionAr: optionalText(500),
  imageUrl: optionalUrl,
  sortOrder: z.coerce.number().int({ message: "required" }).min(0).max(10000).default(0),
  isActive: checkbox,
});

/** Empty -> null (unpriced, valid). Otherwise a price from 0.01 up to 100,000.00 in agorot. */
const priceInput = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const minor = toMinor(value);
    if (minor === null || minor < 1 || minor > MAX_PRICE_MINOR) {
      ctx.addIssue({ code: "custom", message: "invalidPrice" });
      return z.NEVER;
    }
    return minor;
  });

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  brandId: z.string().uuid({ message: "required" }),
  nameEn: requiredText(160),
  nameAr: optionalText(160),
  slug,
  descriptionEn: optionalText(4000),
  descriptionAr: optionalText(4000),
  researchFocusEn: optionalText(300),
  researchFocusAr: optionalText(300),
  usageEn: optionalText(2000),
  usageAr: optionalText(2000),
  warningsEn: optionalText(2000),
  warningsAr: optionalText(2000),
  vialSize: optionalText(40),
  purityCoa: optionalText(80),
  price: priceInput,
  status: z.enum(["draft", "published", "unpublished"], { message: "required" }),
  isFeatured: checkbox,
  sortOrder: z.coerce.number().int({ message: "required" }).min(0).max(10000).default(0),
  categoryIds: z.array(z.string().uuid()).max(50).default([]),
});

export const MAX_PRODUCT_IMAGES = 10;

export const imageUrlSchema = z
  .string()
  .trim()
  .min(1, { message: "required" })
  .max(500, { message: "tooLong" })
  .refine(isAllowedImageUrl, { message: "invalidImageUrl" });

export const orderStatusSchema = z.enum([
  "new",
  "processing",
  "out_for_delivery",
  "completed",
  "cancelled",
]);

export const settingsSchema = z
  .object({
    storeName: requiredText(80),
    logoUrl: optionalUrl,
    phone: optionalText(40),
    whatsappNumber: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((v) => (v ? v.replace(/[\s()+-]/g, "") : null))
      .refine((v) => v === null || /^\d{8,15}$/.test(v), { message: "invalidWhatsapp" }),
    email: z
      .string()
      .trim()
      .max(200, { message: "tooLong" })
      .optional()
      .nullable()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || z.string().email().safeParse(v).success, {
        message: "invalidEmail",
      }),
    address: optionalText(300),
    deliveryEnabled: checkbox,
    deliveryFee: z
      .string()
      .trim()
      .optional()
      .transform((value, ctx) => {
        if (!value) return 0;
        const minor = toMinor(value);
        if (minor === null || minor > MAX_PRICE_MINOR) {
          ctx.addIssue({ code: "custom", message: "invalidPrice" });
          return z.NEVER;
        }
        return minor;
      }),
    unpricedBehavior: z.enum(["ask_price", "hide_price"], { message: "required" }),
    defaultLocale: z.enum(["en", "ar"], { message: "required" }),
    supportedLocales: z.array(z.enum(["en", "ar"])).min(1, { message: "required" }),
    maxLineQuantity: z.coerce.number().int({ message: "required" }).min(1).max(100),
  })
  .refine((v) => v.supportedLocales.includes(v.defaultLocale), {
    message: "defaultNotSupported",
    path: ["defaultLocale"],
  });

export const pageSchema = z.object({
  slug: z.enum(PAGE_SLUGS),
  titleEn: requiredText(120),
  titleAr: optionalText(120),
  bodyEn: z.string().max(60000, { message: "tooLong" }).default(""),
  bodyAr: optionalText(60000),
  isPlaceholder: checkbox,
});

/** First error code per field, for action results. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Reads a FormData into a plain object; repeated keys become arrays for the given names. */
export function formDataToObject(
  formData: FormData,
  arrayKeys: string[] = []
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue; // Next.js internals
    out[key] = arrayKeys.includes(key) ? formData.getAll(key) : formData.get(key);
  }
  for (const key of arrayKeys) out[key] ??= [];
  return out;
}
