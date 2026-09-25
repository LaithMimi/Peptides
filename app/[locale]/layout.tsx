import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Fraunces, DM_Sans, IBM_Plex_Mono, Noto_Kufi_Arabic } from "next/font/google";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-store";
import { siteUrl } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import "../globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("name"), template: `%s | ${t("name")}` },
    description: t("tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const tLegal = await getTranslations({ locale, namespace: "legal" });

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fraunces.variable} ${dmSans.variable} ${plexMono.variable} ${notoKufiArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/*
THESIS: One repeating unit, the die-cut pharmaceutical vial label, builds
every surface — refusing the neon "research-chemical" warehouse look while
staying true to the brand mark's own white-and-navy identity.
OWN-WORLD: White/off-white ground, deep navy ink, one cornflower-blue
accent reserved for seals and primary actions — matched to the Pep Club
logo; apothecary-serif small-caps headings, plain monospace batch/lot
data; label-shaped cards, each independently rotated a few degrees as if
pinned to a shelf.
STORY: A visitor recognizes a boutique, verified, curated apothecary — not
a bulk vendor — and trusts it enough to submit a quote request.
FIRST VIEWPORT: Header as a label plate (wordmark + tagline), hero as one
large label carrying the real headline, then a shelf-grid of product-label
cards below.
FORM: Vial-Label System — candidate 3 of 7 grounded directions, assigned by
concept-seed (mode: persuade, seed key 44cf6903), chosen over the
Instrument-Panel alternate.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
        */}
        <NextIntlClientProvider>
          <CartProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-navy focus:px-4 focus:py-2 focus:text-navy-foreground"
            >
              {tLegal("skipToContent")}
            </a>
            <SiteHeader />
            <main
              id="main"
              tabIndex={-1}
              className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-6 lg:px-8"
            >
              {children}
            </main>
            <SiteFooter />
            <CookieConsent />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
