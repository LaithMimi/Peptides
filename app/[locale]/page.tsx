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
import { ScrollIndicator } from "@/components/scroll-indicator";
import Image from "next/image";
import type { CSSProperties } from "react";
import heroPhoto from "@/public/hero/pep-club-vial.jpeg";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const [categories, featuredAll, brands, settings] = await Promise.all([
    listCategories(),
    listFeatured(8),
    listActiveBrands(),
    getSettings(),
  ]);


  const featured = featuredAll;

  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      {/* The studio hero: one dark panel, the vial photograph on the end side
          melting into the panel's own navy, copy on the start side. The photo
          is never mirrored for Arabic (its label would read backwards); the
          panel mirrors around it instead. */}
      <section aria-labelledby="home-hero" className="hero-studio">
        <div className="hero-studio-photo" aria-hidden="true">
          <Image
            src={heroPhoto}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 52rem, 100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-studio-copy">
          <h1 id="home-hero" className="hero-focus type-display text-white">
            {t("heroTitle")}
          </h1>
          <p
            className="hero-focus mt-5 max-w-md text-lg text-(--studio-ink-soft) sm:text-xl"
            style={{ "--delay": "90ms" } as CSSProperties}
          >
            {t("heroBody")}
          </p>
          <div
            className="hero-focus mt-8 flex flex-wrap items-center gap-3"
            style={{ "--delay": "170ms" } as CSSProperties}
          >
            <Link
              href="/shop"
              className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide"
            >
              {t("heroCta")}
            </Link>
            <Link
              href="/start"
              className="btn-on-dark inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide"
            >
              {t("pickerCta")}
            </Link>
          </div>
        </div>
      </section>

      <ScrollIndicator href="#after-hero" label={t("scrollDown")} />

      <div id="after-hero">
        <DisclaimerBanner />
      </div>

      {categories.length > 0 && (
        <section aria-labelledby="home-areas" className="flex flex-col gap-3">
          <h2
            id="home-areas"
            className="type-heading text-navy"
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
              className="type-heading text-navy"
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
          <div className="grid grid-cols-1 gap-x-3 gap-y-5 min-[20rem]:grid-cols-2 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
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
            className="type-heading text-navy"
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
