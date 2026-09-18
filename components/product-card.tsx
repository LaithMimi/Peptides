import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/types/catalog";
import type { Locale } from "@/i18n/routing";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const t = useTranslations("catalog");
  const locale = useLocale() as Locale;
  const translation = product.translations[locale];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="aspect-square w-full overflow-hidden bg-background">
        <Image
          src={product.image}
          alt=""
          width={400}
          height={400}
          priority={priority}
          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-foreground">{product.name}</h3>
        <p className="text-sm text-muted">{translation.tagline}</p>
        <span className="mt-3 text-sm font-medium text-primary">
          {t("viewDetails")}
          <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
