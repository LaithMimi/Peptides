import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPage } from "@/lib/db/queries/pages";
import { pick } from "@/lib/i18n-fields";
import { excerpt, pageMetadata } from "@/lib/seo";
import { CmsPage } from "@/components/store/cms-page";
import { EraseLocalData } from "@/components/erase-local-data";

// The About page has its own route; everything else editable lives here.
const LEGAL_SLUGS = ["terms", "privacy", "shipping-returns", "product-disclaimer", "cookies"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!LEGAL_SLUGS.includes(slug)) return {};
  const page = await getPage(slug);
  if (!page) return {};
  return pageMetadata({
    title: pick(page, "title", locale) ?? page.titleEn,
    description: excerpt(pick(page, "body", locale)),
    path: `/legal/${slug}`,
    locale,
  });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!LEGAL_SLUGS.includes(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <CmsPage slug={slug} locale={locale}>
      {slug === "cookies" && <EraseLocalData />}
      {slug === "privacy" && (
        <p>
          <Link
            href="/data-request"
            className="font-semibold text-accent underline underline-offset-2"
          >
            {t("footer.dataRequest")}
          </Link>
        </p>
      )}
    </CmsPage>
  );
}
