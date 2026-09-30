import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Noto_Kufi_Arabic } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-store";
import { siteUrl } from "@/lib/seo";
import { getChromeCategories } from "@/lib/db/queries/chrome";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { GoalPickerModal } from "@/components/store/goal-picker-modal";
import "../globals.css";

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
  const [tLegal, purposeTiles] = await Promise.all([
    getTranslations({ locale, namespace: "legal" }),
    getChromeCategories(),
  ]);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${GeistSans.variable} ${GeistMono.variable} ${notoKufiArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/*
THESIS: Pep Club as the category-standard storefront, executed at real
craft rather than another experimental "world" — chosen directly by the
client after two visual-world rolls (Vial-Label, then Glass Case) were
tried and retired.
OWN-WORLD: The client's four-color palette, used by role only — Soft White
ground, Jet Black body ink, Bold Blue headings, Light Blue for the one
primary button per page, prices, selections and focus; no colored regions;
plain bordered cards with a conventional shadow on
hover, real seeded product photography carrying visual weight instead of
a signature glow device; Geist throughout, mono for data.
STORY: A visitor recognizes an ordinary, trustworthy, premium-feeling
storefront — familiar enough to shop confidently, credible enough (real
photography, generous whitespace, confident type) to place a real
cash-on-delivery order.
FIRST VIEWPORT: Header band (logo, nav, cart, locale — no account/sign-in)
atop a plain split hero: headline/subhead/CTA at left, a clean grid of
real featured-product photos at right.
FORM: The category standard (canon) — chosen directly over a degraded
third direction roll (seed key 51d42a69, network unreachable, assigned
"Terracotta Crucible"); quality bar named by the client: Apple.com,
Sephora/Glossier-style beauty retail.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
        */}
        <NextIntlClientProvider>
          <CartProvider>
            <GoalPickerModal categories={purposeTiles} />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
            >
              {tLegal("skipToContent")}
            </a>
            <SiteHeader />
            <main
              id="main"
              tabIndex={-1}
              className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-28 outline-none sm:px-6 lg:px-8"
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
