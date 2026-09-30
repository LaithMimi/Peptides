import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listActiveBrands, listCategories, listFeatured } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pick } from "@/lib/i18n-fields";
import { ProductCard } from "@/components/product-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { HowToUse } from "@/components/how-to-use";
import { FeedbackSection } from "@/components/feedback-section";
import { HeroVideo } from "@/components/home/hero-video";
import { HomeScrollState } from "@/components/home/scroll-state";

const gutter = "mx-auto w-full max-w-[1400px] px-6 md:px-12";

/** Left: orange rule + title. Right: whatever the section delivers. */
function TwoColumn({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`${gutter} grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-24`}
    >
      <div className="flex flex-col gap-6">
        <span className="home-rule" aria-hidden="true" />
        <h2
          id={id}
          className="text-balance text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-navy"
        >
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

/** Numbered horizontal tags: "01 / Name". */
function NumberedTags({ items }: { items: { key: string; href: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-1">
      {items.map((item, i) => (
        <li key={item.key}>
          <Link href={item.href} className="home-tag">
            <span className="tabular-nums" dir="ltr">
              {String(i + 1).padStart(2, "0")} /
            </span>
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tTrust = await getTranslations("trust");
  const tDisc = await getTranslations("disclaimer");
  const [categories, featured, brands, settings] = await Promise.all([
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

  return (
    <div className="flex flex-col">
      {/*
THESIS: A cinematic full-bleed hero and editorial numbered sections replace
the catalog-first shelf on the homepage only; the storefront system holds
everywhere else.
OWN-WORLD: #030303 ground, white type, one #ff5e00 accent (rules, hovers),
Inter at extremes (72px/-0.05em vs 10px/0.4em), 12px-blur glass pills.
STORY: Visitor sees research peptides, brands and cash on delivery at once,
then shops or picks a research area.
FIRST VIEWPORT: Fixed glass nav; center-left headline + two glass CTAs over
looping video; corner metadata bottom-left/right with floating scroll cue.
FORM: Brief-pinned (client), no roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
      */}
      <HomeScrollState />

      <section className="home-hero-backdrop relative flex min-h-[640px] h-svh flex-col overflow-hidden">
        <HeroVideo />
        <div className="home-hero-scrim absolute inset-0" aria-hidden="true" />
        <div
          className="home-hero-fade absolute inset-x-0 bottom-0 h-40"
          aria-hidden="true"
        />

        <div className={`${gutter} relative z-10 flex flex-1 flex-col justify-center pt-28 pb-32`}>
          <div className="max-w-4xl">
            <h1 className="text-balance text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.05em] text-white lg:leading-[1.333]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-[1.6] text-white/60">{t("heroBody")}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="btn-glass inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm"
              >
                {t("heroCta")}
              </Link>
              <Link
                href="/start"
                className="btn-glass inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm"
              >
                {t("pickerCta")}
              </Link>
            </div>
            <p className="home-label mt-12">{t("heroTag")}</p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 pb-8">
          <div className={`${gutter} flex items-end justify-between gap-6`}>
            <p className="home-meta max-w-[16rem]">{tDisc("short")}</p>
            <div className="flex items-center gap-4">
              <p className="home-meta">
                {new Date().getFullYear()} · {t("areasCount", { count: categories.length })}
              </p>
              <a href="#content" className="home-scroll-cue" aria-label={t("scrollDown")}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="home-float size-4"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="content" className="flex scroll-mt-0 flex-col gap-32 py-32">
        {categories.length > 0 && (
          <TwoColumn id="home-areas" title={t("researchAreasTitle")}>
            <NumberedTags
              items={categories.map((c) => ({
                key: c.slug,
                href: `/categories/${c.slug}`,
                label: pick(c, "name", locale) ?? c.nameEn,
              }))}
            />
            <p className="max-w-xl text-lg leading-[1.6] text-white/60">{t("areasBody")}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {trustMarkers.map((marker) => (
                <li key={marker} className="home-label">
                  {marker}
                </li>
              ))}
            </ul>
          </TwoColumn>
        )}

        {featured.length > 0 && (
          <section aria-labelledby="home-featured" className={`${gutter} flex flex-col gap-10`}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="flex flex-col gap-6">
                <span className="home-rule" aria-hidden="true" />
                <h2
                  id="home-featured"
                  className="text-balance text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-navy"
                >
                  {t("featuredTitle")}
                </h2>
              </div>
              <Link href="/shop" className="btn-glass inline-flex min-h-11 items-center rounded-full px-6 py-3 text-sm">
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

        <div className={gutter}>
          <DisclaimerBanner />
        </div>

        <div className={gutter}>
          <HowToUse />
        </div>

        {brands.length > 0 && (
          <TwoColumn id="home-brands" title={t("brandsTitle")}>
            <NumberedTags
              items={brands.map((b) => ({
                key: b.slug,
                href: `/brands/${b.slug}`,
                label: pick(b, "name", locale) ?? b.nameEn,
              }))}
            />
            <p className="max-w-xl text-lg leading-[1.6] text-white/60">{t("brandsBody")}</p>
          </TwoColumn>
        )}

        <div className={gutter}>
          <FeedbackSection />
        </div>
      </div>
    </div>
  );
}
