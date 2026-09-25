import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/i18n-fields";
import type { BrandGroup as BrandGroupData } from "@/lib/db/queries/catalog";
import { ProductCard } from "@/components/product-card";
import type { UnpricedBehavior } from "@/components/store/price-display";

/** One brand heading followed by its products in a responsive grid. */
export function BrandGroup({
  group,
  behavior,
}: {
  group: BrandGroupData;
  behavior: UnpricedBehavior;
}) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const brandName = pick(group.brand, "name", locale) ?? group.brand.nameEn;

  return (
    <section aria-labelledby={`brand-${group.brand.slug}`} className="flex flex-col gap-4">
      <h2
        id={`brand-${group.brand.slug}`}
        className="border-b border-dashed border-border-strong pb-2 font-serif text-xl font-semibold uppercase tracking-wide text-navy"
      >
        <Link
          href={`/brands/${group.brand.slug}`}
          className="hover:text-accent"
          aria-label={t("brandProductsHeading", { brand: brandName })}
        >
          {brandName}
        </Link>
      </h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
        {group.products.map((product) => (
          <ProductCard key={product.id} product={product} behavior={behavior} />
        ))}
      </div>
    </section>
  );
}
