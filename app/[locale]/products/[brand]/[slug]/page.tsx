import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProduct } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pick } from "@/lib/i18n-fields";
import { excerpt, pageMetadata, siteUrl } from "@/lib/seo";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { LtrValue } from "@/components/ltr-value";
import { VialGlyph } from "@/components/vial-glyph";
import { CategoryChips } from "@/components/store/category-chips";
import { PriceDisplay } from "@/components/store/price-display";
import { ProductActions } from "@/components/store/product-actions";

type Params = { locale: string; brand: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, brand, slug } = await params;
  const detail = await getProduct(brand, slug);
  if (!detail) return {};
  const name = pick(detail.product, "name", locale) ?? detail.product.nameEn;
  const brandName = pick(detail.brand, "name", locale) ?? detail.brand.nameEn;
  return pageMetadata({
    title: `${name} — ${brandName}`,
    description: excerpt(
      pick(detail.product, "description", locale) ?? pick(detail.product, "researchFocus", locale)
    ),
    path: `/products/${brand}/${slug}`,
    locale,
    image: detail.images[0]?.url,
  });
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { locale, brand, slug } = await params;
  setRequestLocale(locale);
  const detail = await getProduct(brand, slug);
  if (!detail) notFound();

  const t = await getTranslations("product");
  const settings = await getSettings();
  const { product, images, categories } = detail;
  const name = pick(product, "name", locale) ?? product.nameEn;
  const brandName = pick(detail.brand, "name", locale) ?? detail.brand.nameEn;
  const focus = pick(product, "researchFocus", locale);
  const description = pick(product, "description", locale);
  const usage = pick(product, "usage", locale);
  const warnings = pick(product, "warnings", locale);
  const [main, ...rest] = images;

  // Structured data: a price/offer is included only when the product has one.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: { "@type": "Brand", name: brandName },
    description: description ?? focus ?? undefined,
    image: images.map((i) => (i.url.startsWith("http") ? i.url : `${siteUrl()}${i.url}`)),
    ...(product.priceMinor !== null
      ? {
          offers: {
            "@type": "Offer",
            price: (product.priceMinor / 100).toFixed(2),
            priceCurrency: "ILS",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <div className="flex flex-col gap-6" data-product-id={product.id}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Link
        href="/shop"
        className="inline-flex min-h-11 w-fit items-center font-mono text-xs font-semibold uppercase tracking-widest text-navy hover:text-accent hover:underline"
      >
        <span aria-hidden="true" className="me-1 inline-block rtl:rotate-180">
          ←
        </span>
        {t("backToShop")}
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col gap-3 md:sticky md:top-6 md:self-start">
          <div className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl border-2 border-navy bg-surface-raised max-md:mx-auto">
            {main ? (
              <Image
                src={main.url}
                alt={pick(main, "alt", locale) ?? name}
                width={768}
                height={768}
                sizes="(min-width: 768px) 24rem, 90vw"
                priority
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                role="img"
                aria-label={t("noImage")}
                className="flex h-full w-full items-center justify-center text-muted"
              >
                <VialGlyph className="size-24" />
              </div>
            )}
          </div>
          {rest.length > 0 && (
            <ul aria-label={t("imageGallery")} className="flex max-w-sm gap-2 max-md:mx-auto">
              {rest.map((image) => (
                <li
                  key={image.id}
                  className="size-16 overflow-hidden rounded-lg border border-border-strong bg-surface-raised"
                >
                  <Image
                    src={image.url}
                    alt={pick(image, "alt", locale) ?? name}
                    width={128}
                    height={128}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              <Link href={`/brands/${detail.brand.slug}`} className="hover:text-accent hover:underline">
                {brandName}
              </Link>
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold uppercase tracking-wide text-navy sm:text-3xl">
              {name}
            </h1>
            {focus && <p className="mt-1 text-muted">{focus}</p>}
          </div>

          <PriceDisplay
            priceMinor={product.priceMinor}
            behavior={settings.unpricedBehavior}
            className="text-2xl"
          />

          <ProductActions
            product={{ id: product.id, name, priceMinor: product.priceMinor }}
            behavior={settings.unpricedBehavior}
            whatsappNumber={settings.whatsappNumber}
            maxQuantity={settings.maxLineQuantity}
          />

          {description && <p className="text-foreground">{description}</p>}

          {(product.vialSize || product.purityCoa) && (
            <dl className="grid grid-cols-2 gap-4 border-y border-dashed border-border py-4 text-sm">
              {product.vialSize && (
                <div>
                  <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                    {t("vialLabel")}
                  </dt>
                  <dd className="mt-1 font-mono text-foreground">
                    <LtrValue>{product.vialSize}</LtrValue>
                  </dd>
                </div>
              )}
              {product.purityCoa && (
                <div>
                  <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                    {t("purityLabel")}
                  </dt>
                  <dd className="mt-1 font-mono text-foreground">
                    <LtrValue>{product.purityCoa}</LtrValue>
                  </dd>
                </div>
              )}
            </dl>
          )}

          {categories.length > 0 && (
            <div>
              <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-navy">
                {t("researchAreasTitle")}
              </h2>
              <div className="mt-2">
                <CategoryChips categories={categories} />
              </div>
            </div>
          )}

          {usage && (
            <div>
              <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-navy">
                {t("usageTitle")}
              </h2>
              <p className="mt-1 whitespace-pre-line text-foreground">{usage}</p>
            </div>
          )}

          {warnings && (
            <div className="rounded-lg border-2 border-dashed border-border-strong bg-surface p-4">
              <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-navy">
                {t("warningsTitle")}
              </h2>
              <p className="mt-1 whitespace-pre-line text-foreground">{warnings}</p>
            </div>
          )}

          <DisclaimerBanner variant="compact" />
        </div>
      </div>
    </div>
  );
}
