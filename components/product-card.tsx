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
      className="group flex flex-col gap-2 overflow-hidden rounded-xl bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-raised">
        <Image
          src={product.image}
          alt={product.name}
          width={320}
          height={240}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-0.5">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          <LtrValue>{product.vials[0]?.label}</LtrValue>
        </span>
        <h2 className="font-serif text-base font-semibold uppercase tracking-wide text-navy">
          {product.name}
        </h2>
        <p className="line-clamp-2 text-xs text-muted">{translation.tagline}</p>
        <span className="mt-0.5 font-serif text-xs font-medium italic text-navy group-hover:text-accent">
          {t("viewDetails")}
          <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
