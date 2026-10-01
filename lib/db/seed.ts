import { and, eq, isNull, or } from "drizzle-orm";
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
    nameEn: "Recovery & tissue",
    nameAr: "التعافي وتجدد الأنسجة",
    descriptionEn:
      "Peptides of interest in recovery and tissue-repair pathways. (Placeholder text: replace with client-approved wording.)",
    descriptionAr:
      "ببتيدات ذات أهمية بحثية في مسارات التعافي وإصلاح الأنسجة. (نص مؤقت: يُستبدل بصياغة معتمدة من العميل.)",
  },
  {
    slug: "growth-hormone",
    nameEn: "Growth hormone",
    nameAr: "هرمون النمو",
    descriptionEn:
      "Peptides of interest in growth hormone signalling pathways. (Placeholder text: replace with client-approved wording.)",
    descriptionAr:
      "ببتيدات ذات أهمية بحثية في مسارات إشارات هرمون النمو. (نص مؤقت: يُستبدل بصياغة معتمدة من العميل.)",
  },
  {
    slug: "metabolic",
    nameEn: "Metabolic",
    nameAr: "التمثيل الغذائي",
    descriptionEn:
      "Peptides of interest in cellular energy and metabolic pathways. (Placeholder text: replace with client-approved wording.)",
    descriptionAr:
      "ببتيدات ذات أهمية بحثية في مسارات الطاقة الخلوية والتمثيل الغذائي. (نص مؤقت: يُستبدل بصياغة معتمدة من العميل.)",
  },
  {
    slug: "gut",
    nameEn: "Gut & gastrointestinal",
    nameAr: "الأمعاء والجهاز الهضمي",
    descriptionEn:
      "Peptides of interest in gastrointestinal and gut-related pathways. (Placeholder text: replace with client-approved wording.)",
    descriptionAr:
      "ببتيدات ذات أهمية بحثية في مسارات الجهاز الهضمي والأمعاء. (نص مؤقت: يُستبدل بصياغة معتمدة من العميل.)",
  },
  {
    slug: "skin-tissue",
    nameEn: "Skin, hair & tissue",
    nameAr: "البشرة والشعر والأنسجة",
    descriptionEn:
      "Peptides of interest in skin, hair and connective-tissue biology. (Placeholder text: replace with client-approved wording.)",
    descriptionAr:
      "ببتيدات ذات أهمية بحثية في بيولوجيا البشرة والشعر والأنسجة الضامة. (نص مؤقت: يُستبدل بصياغة معتمدة من العميل.)",
  },
  {
    slug: "cognitive",
    nameEn: "Focus & cognitive",
    nameAr: "التركيز والوظائف المعرفية",
    descriptionEn:
      "Peptides of interest in attention and cognitive-function pathways. (Placeholder text: replace with client-approved wording.)",
    descriptionAr:
      "ببتيدات ذات أهمية بحثية في مسارات الانتباه والوظائف المعرفية. (نص مؤقت: يُستبدل بصياغة معتمدة من العميل.)",
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
  await db
    .insert(storeSettings)
    .values({ id: 1, email: CONTACT.email })
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

  // Fill in Arabic category descriptions on databases seeded before they
  // existed. Only blank values are touched, so admin edits are never overwritten.
  for (const c of CATEGORY_SEED) {
    await db
      .update(categories)
      .set({ descriptionAr: c.descriptionAr })
      .where(
        and(
          eq(categories.slug, c.slug),
          or(isNull(categories.descriptionAr), eq(categories.descriptionAr, ""))
        )
      );
  }

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
