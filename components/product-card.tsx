import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/i18n-fields";
import type { ProductCardData } from "@/lib/db/queries/catalog";
import { LtrValue } from "@/components/ltr-value";
import { VialGlyph } from "@/components/vial-glyph";
import { PriceDisplay, type UnpricedBehavior } from "@/components/store/price-display";

export function ProductCard({
  product,
  behavior,
}: {
  product: ProductCardData;
  behavior: UnpricedBehavior;
}) {
  const t = useTranslations("catalog");
  const tp = useTranslations("product");
  const locale = useLocale();
  const name = pick(product, "name", locale) ?? product.nameEn;
  const brandName = pick(product.brand, "name", locale) ?? product.brand.nameEn;
  const focus = pick(product, "researchFocus", locale);
  const alt = (product.image && pick(product.image, "alt", locale)) || name;

  return (
    <Link
      href={`/products/${product.brand.slug}/${product.slug}`}
      className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-raised">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={alt}
            width={320}
            height={240}
            sizes="(min-width: 1280px) 15rem, (min-width: 640px) 30vw, 46vw"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            role="img"
            aria-label={tp("noImage")}
            className="flex h-full w-full items-center justify-center text-muted"
          >
            <VialGlyph className="size-14" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-0.5">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {brandName}
          {product.vialSize && (
            <>
              {" · "}
              <LtrValue>{product.vialSize}</LtrValue>
            </>
          )}
        </span>
        <h3 className="font-serif text-base font-semibold uppercase tracking-wide text-navy">
          {name}
        </h3>
        {focus && <p className="line-clamp-2 text-xs text-muted">{focus}</p>}
        <div className="mt-1 flex flex-col gap-0.5 text-sm">
          <PriceDisplay priceMinor={product.priceMinor} behavior={behavior} />
          <span className="font-serif text-xs font-medium italic text-navy group-hover:text-accent">
            {t("viewDetails")}
            <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
