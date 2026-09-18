import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/types/catalog";
import type { Locale } from "@/i18n/routing";
import { VialGlyph } from "@/components/vial-glyph";
import { LtrValue } from "@/components/ltr-value";
import { labelRotation } from "@/lib/label-rotation";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("catalog");
  const locale = useLocale() as Locale;
  const translation = product.translations[locale];
  const rotation = labelRotation(product.id);

  return (
    <Link
      href={`/products/${product.id}`}
      style={{ "--tilt": `${rotation}deg` } as React.CSSProperties}
      className="group flex flex-col gap-3 rounded-2xl border border-border-strong bg-surface p-5 shadow-sm transition-[transform,box-shadow] duration-200 [transform:rotate(var(--tilt))] hover:z-10 hover:-translate-y-0.5 hover:rotate-0 hover:shadow-md focus-visible:z-10 focus-visible:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-center justify-between">
        <VialGlyph className="size-9 text-accent" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          <LtrValue>{product.vials[0]?.label}</LtrValue>
        </span>
      </div>
      <div className="border-t border-dashed border-border" />
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          {product.name}
        </h3>
        <p className="text-sm text-muted">{translation.tagline}</p>
      </div>
      <span className="font-serif text-sm font-medium italic text-accent">
        {t("viewDetails")}
        <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
          →
        </span>
      </span>
    </Link>
  );
}
