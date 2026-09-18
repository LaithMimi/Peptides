import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActiveProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { FeedbackSection } from "@/components/feedback-section";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const tTrust = await getTranslations("trust");
  const products = getActiveProducts();

  const trustMarkers = [tTrust("curated"), tTrust("quoteBased"), tTrust("bilingual")];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl border-2 border-navy bg-surface-raised p-6 sm:p-10">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("subtitle")}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {trustMarkers.map((marker) => (
            <li
              key={marker}
              className="rounded-full border border-border-strong bg-surface px-3 py-1 font-mono text-xs uppercase tracking-widest text-navy"
            >
              {marker}
            </li>
          ))}
        </ul>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <FeedbackSection />
    </div>
  );
}
