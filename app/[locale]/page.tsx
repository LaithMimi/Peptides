import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listActiveBrands, listCategories, listFeatured } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pick } from "@/lib/i18n-fields";
import { ProductCard } from "@/components/product-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { FeedbackSection } from "@/components/feedback-section";
import { CategoryChips } from "@/components/store/category-chips";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tTrust = await getTranslations("trust");
  const [categories, featured, brands, settings] = await Promise.all([
    listCategories(),
    listFeatured(4),
    listActiveBrands(),
    getSettings(),
  ]);

  const trustMarkers = [tTrust("curated"), tTrust("quoteBased"), tTrust("bilingual")];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl border-2 border-navy bg-surface-raised p-6 sm:p-10">
        <h1 className="max-w-3xl font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("heroBody")}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-accent-foreground hover:opacity-90"
          >
            {t("heroCta")}
          </Link>
          <Link
            href="/start"
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-navy px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-navy hover:bg-navy hover:text-navy-foreground"
          >
            {t("pickerCta")}
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {trustMarkers.map((marker) => (
            <li
              key={marker}
              className="rounded-full border border-border-strong bg-surface px-3 py-1 font-mono text-xs uppercase tracking-widest text-navy"
            >
              {marker}
            </li>
          ))}
        </ul>
      </div>

      <DisclaimerBanner />

      {categories.length > 0 && (
        <section aria-labelledby="home-areas" className="flex flex-col gap-3">
          <h2
            id="home-areas"
            className="font-serif text-xl font-semibold uppercase tracking-wide text-navy"
          >
            {t("researchAreasTitle")}
          </h2>
          <CategoryChips categories={categories} />
        </section>
      )}

      {featured.length > 0 && (
        <section aria-labelledby="home-featured" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="home-featured"
              className="font-serif text-xl font-semibold uppercase tracking-wide text-navy"
            >
              {t("featuredTitle")}
            </h2>
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center font-serif text-sm font-semibold uppercase tracking-wide text-navy hover:text-accent hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} behavior={settings.unpricedBehavior} />
            ))}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section aria-labelledby="home-brands" className="flex flex-col gap-3">
          <h2
            id="home-brands"
            className="font-serif text-xl font-semibold uppercase tracking-wide text-navy"
          >
            {t("brandsTitle")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <li key={brand.slug}>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-border-strong bg-surface-raised px-4 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-navy hover:border-navy"
                >
                  {pick(brand, "name", locale) ?? brand.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FeedbackSection />
    </div>
  );
}
