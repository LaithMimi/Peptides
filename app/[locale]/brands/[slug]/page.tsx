import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBrand, listShop } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pick } from "@/lib/i18n-fields";
import { excerpt, pageMetadata } from "@/lib/seo";
import { BrandGroup } from "@/components/store/brand-group";
import { Pagination } from "@/components/store/pagination";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return {};
  return pageMetadata({
    title: pick(brand, "name", locale) ?? brand.nameEn,
    description: excerpt(pick(brand, "description", locale)),
    path: `/brands/${slug}`,
    locale,
    image: brand.logoUrl,
  });
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const page = Number((await searchParams).page) || 1;
  const t = await getTranslations("shop");
  const [result, settings] = await Promise.all([
    listShop({ brandSlug: slug, page }),
    getSettings(),
  ]);
  const description = pick(brand, "description", locale);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        {brand.logoUrl && (
          <Image
            src={brand.logoUrl}
            alt=""
            width={96}
            height={96}
            className="h-16 w-16 object-contain"
          />
        )}
        <div>
          <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
            {pick(brand, "name", locale) ?? brand.nameEn}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
        </div>
      </header>

      <DisclaimerBanner variant="compact" />

      <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
        {t("results", { count: result.total })}
      </p>

      {result.groups.length === 0 ? (
        <p className="text-muted">{t("empty")}</p>
      ) : (
        result.groups.map((group) => (
          <BrandGroup key={group.brand.slug} group={group} behavior={settings.unpricedBehavior} />
        ))
      )}

      <Pagination
        pathname={`/brands/${slug}`}
        query={{}}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </div>
  );
}
