import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listActiveBrands, listCategories, listShop } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pageMetadata } from "@/lib/seo";
import { BrandGroup } from "@/components/store/brand-group";
import { Filters } from "@/components/store/filters";
import { Pagination } from "@/components/store/pagination";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return pageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/shop",
    locale,
  });
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const brand = first(sp.brand) || undefined;
  const area = first(sp.area) || undefined;
  const listed = first(sp.price) === "listed";
  const page = Number(first(sp.page)) || 1;

  const t = await getTranslations("shop");
  const [result, brands, categories, settings] = await Promise.all([
    listShop({ brandSlug: brand, categorySlugs: area ? [area] : undefined, listedOnly: listed, page }),
    listActiveBrands(),
    listCategories(),
    getSettings(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">{t("subtitle")}</p>
      </header>

      <DisclaimerBanner variant="compact" />

      <Filters brands={brands} categories={categories} active={{ brand, area, listed }} />

      <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
        {t("results", { count: result.total })}
      </p>

      {result.groups.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border-strong px-6 py-12 text-center">
          <p className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
            {t("empty")}
          </p>
          <p className="mt-2 text-muted">{t("emptyHelp")}</p>
        </div>
      ) : (
        result.groups.map((group) => (
          <BrandGroup key={group.brand.slug} group={group} behavior={settings.unpricedBehavior} />
        ))
      )}

      <Pagination
        pathname="/shop"
        query={{ brand, area, price: listed ? "listed" : undefined }}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </div>
  );
}
