import type { MetadataRoute } from "next";
import { listSitemapEntries } from "@/lib/db/queries/catalog";
import { LOCALES, siteUrl } from "@/lib/seo";

// Generated per request from the database so it always matches what is visible.
export const dynamic = "force-dynamic";

const STATIC_PATHS = ["", "/shop", "/brands", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries = await listSitemapEntries();

  const withAlternates = (path: string, lastModified?: Date) =>
    LOCALES.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}/${l}${path}`])),
      },
    }));

  return [
    ...STATIC_PATHS.flatMap((p) => withAlternates(p)),
    ...entries.brands.flatMap((b) => withAlternates(`/brands/${b.slug}`, b.updatedAt)),
    ...entries.categories.flatMap((c) => withAlternates(`/categories/${c.slug}`, c.updatedAt)),
    ...entries.products.flatMap((p) =>
      withAlternates(`/products/${p.brandSlug}/${p.slug}`, p.updatedAt)
    ),
  ];
}
