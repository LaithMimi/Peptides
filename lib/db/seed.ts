import { eq } from "drizzle-orm";
import type { Db } from "./client";
import {
  brands,
  categories,
  pages,
  productCategories,
  productImages,
  products,
  storeSettings,
} from "./schema";
import { CONTACT } from "@/lib/contact";
import seedProducts from "./seed-data/products.json";

/**
 * Idempotent launch data. "PEP Lab" is an ordinary brand row: no code branches
 * on it. Research areas, their descriptions and page texts are PLACEHOLDERS the
 * client must replace with approved wording (spec assumptions). Product copy
 * comes from the site's previous static catalog; prices are left empty.
 */

const BRAND = { slug: "pep-lab", nameEn: "PEP Lab" };

const CATEGORY_SEED = [
  {
    slug: "recovery-tissue",
    nameEn: "Recovery & tissue research",
    nameAr: "التعافي وتجدد الأنسجة",
    descriptionEn:
      "Laboratory research on recovery and tissue-repair pathways. (Placeholder text: replace with client-approved wording.)",
  },
  {
    slug: "growth-hormone",
    nameEn: "Growth hormone pathway research",
    nameAr: "أبحاث هرمون النمو",
    descriptionEn:
      "Laboratory research on growth hormone signalling pathways. (Placeholder text: replace with client-approved wording.)",
  },
  {
    slug: "metabolic",
    nameEn: "Metabolic pathway research",
    nameAr: "أبحاث التمثيل الغذائي",
    descriptionEn:
      "Laboratory research on cellular energy and metabolic pathways. (Placeholder text: replace with client-approved wording.)",
  },
  {
    slug: "gut",
    nameEn: "Gut & gastrointestinal research",
    nameAr: "أبحاث الأمعاء والجهاز الهضمي",
    descriptionEn:
      "Laboratory research on gastrointestinal and gut-related pathways. (Placeholder text: replace with client-approved wording.)",
  },
  {
    slug: "skin-tissue",
    nameEn: "Skin, hair & tissue research",
    nameAr: "أبحاث البشرة والشعر والأنسجة",
    descriptionEn:
      "Laboratory research on skin, hair and connective-tissue biology. (Placeholder text: replace with client-approved wording.)",
  },
  {
    slug: "cognitive",
    nameEn: "Focus & cognitive research",
    nameAr: "أبحاث التركيز والوظائف المعرفية",
    descriptionEn:
      "Laboratory research on attention and cognitive-function pathways. (Placeholder text: replace with client-approved wording.)",
  },
] as const;

const PRODUCT_CATEGORIES: Record<string, string[]> = {
  "tb-500": ["recovery-tissue"],
  ipamorelin: ["growth-hormone", "recovery-tissue"],
  "cjc-1295": ["growth-hormone"],
  retatrutide: ["metabolic"],
  "bpc-157": ["recovery-tissue", "gut"],
  "ghk-cu": ["skin-tissue"],
  "mots-c": ["metabolic"],
  kpv: ["gut"],
  selank: ["cognitive"],
  semax: ["cognitive"],
};

// Test-only: Playwright sets E2E_SEED_PRICES=1 so the purchase flow has priced
// products. Real prices are entered in the admin dashboard.
const E2E_PRICES: Record<string, number> = { "bpc-157": 25000, "ghk-cu": 18050 };

const FEATURED = new Set(["bpc-157", "tb-500", "ghk-cu", "semax"]);

const PLACEHOLDER_EN =
  "Placeholder text. This page is awaiting client-approved content.";
const PLACEHOLDER_AR = "نص مؤقت. هذه الصفحة بانتظار محتوى معتمد من العميل.";

const PAGE_SEED = [
  { slug: "about", titleEn: "About", titleAr: "من نحن" },
  { slug: "terms", titleEn: "Terms & Conditions", titleAr: "الشروط والأحكام" },
  { slug: "privacy", titleEn: "Privacy Policy", titleAr: "سياسة الخصوصية" },
  {
    slug: "shipping-returns",
    titleEn: "Shipping & Returns",
    titleAr: "الشحن والإرجاع",
  },
  {
    slug: "product-disclaimer",
    titleEn: "Product Disclaimer",
    titleAr: "إخلاء مسؤولية المنتجات",
  },
  { slug: "cookies", titleEn: "Cookie Policy", titleAr: "سياسة ملفات تعريف الارتباط" },
] as const;

export async function seedDatabase(db: Db): Promise<void> {
  // The business phone already published on the Contact page doubles as the
  // WhatsApp number until the owner sets their own in admin Settings.
  await db
    .insert(storeSettings)
    .values({
      id: 1,
      phone: CONTACT.phoneDisplay,
      whatsappNumber: CONTACT.phone.replace(/\D/g, ""),
    })
    .onConflictDoNothing();

  await db
    .insert(pages)
    .values(
      PAGE_SEED.map((p) => ({
        ...p,
        bodyEn: PLACEHOLDER_EN,
        bodyAr: PLACEHOLDER_AR,
        isPlaceholder: true,
      }))
    )
    .onConflictDoNothing();

  const existing = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.slug, BRAND.slug));
  if (existing.length > 0) return; // catalog already seeded

  const [brand] = await db.insert(brands).values(BRAND).returning();

  const categoryRows = await db
    .insert(categories)
    .values(CATEGORY_SEED.map((c, i) => ({ ...c, sortOrder: i })))
    .returning();
  const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  for (const [index, p] of seedProducts.entries()) {
    const [row] = await db
      .insert(products)
      .values({
        brandId: brand.id,
        nameEn: p.name,
        slug: p.slug,
        descriptionEn: p.en.description,
        descriptionAr: p.ar.description,
        researchFocusEn: p.en.tagline,
        researchFocusAr: p.ar.tagline,
        vialSize: p.vialSize,
        // Purity is a factual claim: only entered once a COA backs it (see DESIGN.md).
        purityCoa: null,
        priceMinor: process.env.E2E_SEED_PRICES === "1" ? (E2E_PRICES[p.slug] ?? null) : null,
        status: "published",
        isFeatured: FEATURED.has(p.slug),
        sortOrder: index,
      })
      .returning();

    await db
      .insert(productImages)
      .values({ productId: row.id, url: p.image, sortOrder: 0 });

    const categoryIds = (PRODUCT_CATEGORIES[p.slug] ?? [])
      .map((slug) => categoryIdBySlug.get(slug))
      .filter((v): v is string => Boolean(v));
    if (categoryIds.length > 0) {
      await db
        .insert(productCategories)
        .values(categoryIds.map((categoryId) => ({ productId: row.id, categoryId })));
    }
  }
}
