import type { Metadata } from "next";

export const LOCALES = ["en", "ar"] as const;

/** Public origin used for canonical and Open Graph URLs. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export interface PageMetaInput {
  title: string;
  description?: string | null;
  /** Path without locale, starting with "/" (empty string for the home page). */
  path: string;
  locale: string;
  image?: string | null;
  /** Keeps a page (e.g. an order confirmation) out of search results. */
  noindex?: boolean;
}

/** Title, description, canonical, language alternates and Open Graph for one page. */
export function pageMetadata({
  title,
  description,
  path,
  locale,
  image,
  noindex,
}: PageMetaInput): Metadata {
  const base = siteUrl();
  const url = `${base}/${locale}${path}`;
  const absoluteImage = image
    ? image.startsWith("http")
      ? image
      : `${base}${image}`
    : undefined;
  return {
    title,
    description: description ?? undefined,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${base}/${l}${path}`])
      ),
    },
    openGraph: {
      title,
      description: description ?? undefined,
      url,
      type: "website",
      locale: locale === "ar" ? "ar" : "en_US",
      images: absoluteImage ? [{ url: absoluteImage }] : undefined,
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

/** First sentence-ish excerpt, trimmed to a meta-description length. */
export function excerpt(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
