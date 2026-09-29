import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPage } from "@/lib/db/queries/pages";
import { pick } from "@/lib/i18n-fields";
import { excerpt, pageMetadata } from "@/lib/seo";
import { CmsPage } from "@/components/store/cms-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage("about");
  if (!page) return {};
  return pageMetadata({
    title: pick(page, "title", locale) ?? page.titleEn,
    description: excerpt(pick(page, "body", locale)),
    path: "/about",
    locale,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CmsPage slug="about" locale={locale} />;
}
