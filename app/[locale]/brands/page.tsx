import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listActiveBrands } from "@/lib/db/queries/catalog";
import { pick } from "@/lib/i18n-fields";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brands" });
  return pageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/brands",
    locale,
  });
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("brands");
  const th = await getTranslations("home");
  const brands = await listActiveBrands();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">{t("subtitle")}</p>
      </header>

      {brands.length === 0 ? (
        <p className="text-muted">{t("empty")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => {
            const name = pick(brand, "name", locale) ?? brand.nameEn;
            const description = pick(brand, "description", locale);
            return (
              <li key={brand.slug}>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="flex h-full flex-col gap-2 rounded-xl border border-border-strong bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {brand.logoUrl && (
                    <Image
                      src={brand.logoUrl}
                      alt=""
                      width={96}
                      height={96}
                      className="h-16 w-16 object-contain"
                    />
                  )}
                  <span className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
                    {name}
                  </span>
                  {description && (
                    <span className="line-clamp-3 text-sm text-muted">{description}</span>
                  )}
                  <span className="mt-auto font-mono text-xs uppercase tracking-widest text-muted">
                    {th("productCount", { count: brand.productCount })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
