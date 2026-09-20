import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveProducts, getProductById } from "@/lib/products";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { VialSelector } from "@/components/vial-selector";
import { VialGlyph } from "@/components/vial-glyph";
import { LtrValue } from "@/components/ltr-value";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return getActiveProducts().map((product) => ({ slug: product.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = getProductById(slug);
  const t = await getTranslations("product");

  if (!product) {
    notFound();
  }

  const translation = product.translations[locale as Locale];
  // A purity figure is a factual claim: only show it once a certificate of
  // analysis is linked to back it up.
  const purity = product.coaUrl ? product.purity : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="w-fit font-mono text-xs font-semibold uppercase tracking-widest text-accent hover:underline"
      >
        <span aria-hidden="true" className="me-1 inline-block rtl:rotate-180">
          ←
        </span>
        {t("backToCatalog")}
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-navy bg-surface-raised p-8">
          <VialGlyph className="size-28 text-accent" />
          <p className="font-serif text-2xl font-semibold uppercase tracking-wide text-navy">
            {product.name}
          </p>
          <div className="mt-2 rounded-full border border-border-strong bg-surface px-4 py-1 font-mono text-xs uppercase tracking-widest text-muted">
            <LtrValue>
              {product.vials.map((v) => v.label).join(" / ")}
              {purity ? ` · ${purity}` : ""}
            </LtrValue>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-serif text-2xl font-semibold uppercase tracking-wide text-navy sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-1 text-muted">{translation.tagline}</p>
          </div>

          <p className="text-foreground">{translation.description}</p>

          <dl className="grid grid-cols-2 gap-4 border-y border-dashed border-border py-4 text-sm">
            <div>
              <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                {t("vialLabel")}
              </dt>
              <dd className="mt-1 font-mono text-foreground">
                <LtrValue>{product.vials.map((v) => v.label).join(", ")}</LtrValue>
              </dd>
            </div>
            {purity && (
              <div>
                <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                  {t("purityLabel")}
                </dt>
                <dd className="mt-1 font-mono text-foreground">
                  <LtrValue>{purity}</LtrValue>
                </dd>
              </div>
            )}
          </dl>

          <div>
            <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-navy">
              {t("researchAreasTitle")}
            </h2>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-foreground">
              {translation.researchAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>

          <DisclaimerBanner variant="compact" />

          <VialSelector productId={product.id} vials={product.vials} />
        </div>
      </div>
    </div>
  );
}
