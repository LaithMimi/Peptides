import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/types/catalog";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import { LtrValue } from "@/components/ltr-value";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("catalog");
  const locale = useLocale() as Locale;
  const translation = product.translations[locale];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col gap-3 overflow-hidden rounded-2xl bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="aspect-square w-full overflow-hidden bg-surface-raised">
        <Image
          src={product.image}
          alt={product.name}
          width={480}
          height={480}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-5 pb-5 pt-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          <LtrValue>{product.vials[0]?.label}</LtrValue>
        </span>
        <h3 className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          {product.name}
        </h3>
        <p className="text-sm text-muted">{translation.tagline}</p>
        <span className="mt-1 font-serif text-sm font-medium italic text-accent">
          {t("viewDetails")}
          <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
