import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listActiveBrands, listCategories, listFeatured } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pick } from "@/lib/i18n-fields";
import { ProductCard } from "@/components/product-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { HowToUse } from "@/components/how-to-use";
import { FeedbackSection } from "@/components/feedback-section";
import { CategoryChips } from "@/components/store/category-chips";
import { VialGlyph } from "@/components/vial-glyph";
import { ScrollIndicator } from "@/components/scroll-indicator";
import Image from "next/image";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tTrust = await getTranslations("trust");
  const [categories, featuredAll, brands, settings] = await Promise.all([
    listCategories(),
    listFeatured(8),
    listActiveBrands(),
    getSettings(),
  ]);

  // "Multiple brands" is only true once the catalog actually has more than
  // one active brand — showing it against a single-brand launch catalog
  // would be a claim the site can't back, which the design system forbids.
  const trustMarkers = [
    ...(brands.length > 1 ? [tTrust("curated")] : []),
    tTrust("quoteBased"),
    tTrust("bilingual"),
  ];

  // Hero shows the first 4 as a photo collage; the Featured section below shows
  // the full fetched set. These can overlap on a small catalog — that's fine,
  // an empty "Featured products" section (from slicing one small result into
  // two disjoint ranges) is worse than a little repetition.
  const heroProducts = featuredAll.slice(0, 4);
  const featured = featuredAll;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <h1 className="font-serif text-4xl font-semibold uppercase tracking-wide text-navy sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted">{t("heroBody")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide"
            >
              {t("heroCta")}
            </Link>
            <Link
              href="/start"
              className="inline-flex min-h-11 items-center justify-center btn-glass rounded-full px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide"
            >
              {t("pickerCta")}
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {trustMarkers.map((marker) => (
              <li
                key={marker}
                className="rounded-full border border-border-strong bg-surface-raised px-3 py-1 font-mono text-xs uppercase tracking-widest text-navy"
              >
                {marker}
              </li>
            ))}
          </ul>
        </div>
        {heroProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pb-6">
            {heroProducts.map((product, i) => {
              const name = pick(product, "name", locale) ?? product.nameEn;
              const alt = (product.image && pick(product.image, "alt", locale)) || name;
              return (
                <div
                  key={product.id}
                  className={`aspect-square overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-sm ${i % 3 === 1 ? "translate-y-6" : ""}`}
                >
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={alt}
                      width={320}
                      height={320}
                      sizes="(min-width: 1024px) 16rem, 42vw"
                      priority={i === 0}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={name}
                      className="flex h-full w-full items-center justify-center text-muted"
                    >
                      <VialGlyph className="size-12" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ScrollIndicator href="#after-hero" label={t("scrollDown")} />

      <div id="after-hero" className="scroll-mt-28">
        <DisclaimerBanner />
      </div>

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

      <HowToUse />

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
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-border-strong bg-surface-raised px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg active:translate-y-0 active:shadow-sm"
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
