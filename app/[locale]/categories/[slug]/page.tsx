import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategory, listCategories, listShop } from "@/lib/db/queries/catalog";
import { getSettings } from "@/lib/db/queries/settings";
import { pick } from "@/lib/i18n-fields";
import { excerpt, pageMetadata } from "@/lib/seo";
import { BrandGroup } from "@/components/store/brand-group";
import { CategoryChips } from "@/components/store/category-chips";
import { Pagination } from "@/components/store/pagination";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return pageMetadata({
    title: pick(category, "name", locale) ?? category.nameEn,
    description: excerpt(pick(category, "description", locale)),
    path: `/categories/${slug}`,
    locale,
    image: category.imageUrl,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Number((await searchParams).page) || 1;
  const t = await getTranslations("shop");
  const [result, categories, settings] = await Promise.all([
    listShop({ categorySlugs: [slug], page }),
    listCategories(),
    getSettings(),
  ]);
  const description = pick(category, "description", locale);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
          {pick(category, "name", locale) ?? category.nameEn}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </header>

      <CategoryChips categories={categories} currentSlug={slug} />
      <DisclaimerBanner variant="compact" />

      {result.groups.length > 0 && (
        <p className="text-sm text-muted">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest">
            {t("areaBrands")}:
          </span>{" "}
          {result.groups
            .map((g) => pick(g.brand, "name", locale) ?? g.brand.nameEn)
            .join(", ")}
        </p>
      )}

      <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
        {t("results", { count: result.total })}
      </p>

      {result.groups.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border-strong px-6 py-12 text-center">
          <p className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
            {t("empty")}
          </p>
        </div>
      ) : (
        result.groups.map((group) => (
          <BrandGroup key={group.brand.slug} group={group} behavior={settings.unpricedBehavior} />
        ))
      )}

      <Pagination
        pathname={`/categories/${slug}`}
        query={{}}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
      />
    </div>
  );
}
