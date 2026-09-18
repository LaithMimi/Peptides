import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveProducts, getProductById } from "@/lib/products";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { VialSelector } from "@/components/vial-selector";
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

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="w-fit text-sm font-medium text-primary hover:underline">
        <span aria-hidden="true" className="me-1 inline-block rtl:rotate-180">
          ←
        </span>
        {t("backToCatalog")}
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface">
          <Image
            src={product.image}
            alt=""
            width={600}
            height={600}
            priority
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-1 text-muted">{translation.tagline}</p>
          </div>

          <p className="text-foreground">{translation.description}</p>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted">{t("vialLabel")}</dt>
              <dd className="text-foreground">
                {product.vials.map((v) => v.label).join(", ")}
              </dd>
            </div>
            {product.purity && (
              <div>
                <dt className="font-medium text-muted">{t("purityLabel")}</dt>
                <dd className="text-foreground">{product.purity}</dd>
              </div>
            )}
          </dl>

          <div>
            <h2 className="font-medium text-foreground">{t("researchAreasTitle")}</h2>
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
