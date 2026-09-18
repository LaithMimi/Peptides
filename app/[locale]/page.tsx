import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActiveProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const products = getActiveProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-muted">{t("subtitle")}</p>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index === 0} />
        ))}
      </div>
    </div>
  );
}
