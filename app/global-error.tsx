"use client";

import { useEffect, useTransition } from "react";
import { usePathname } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Noto_Kufi_Arabic } from "next/font/google";
import { CONTACT } from "@/lib/contact";
import "./globals.css";

// The last-resort fallback, used only when a root layout itself fails (for
// example the storefront chrome cannot reach the database). It replaces the
// whole document, so it has no next-intl provider: its two languages live here.
const notoKufiArabic = Noto_Kufi_Arabic({ variable: "--font-noto-kufi", subsets: ["arabic"] });

const COPY = {
  en: {
    title: "Something went wrong on our side",
    body: "The store didn’t load. Your cart is saved on this device, so nothing is lost. Try again in a moment.",
    retry: "Try again",
    retrying: "Trying again…",
    home: "Go to the home page",
    contactLead: "If this keeps happening, email us at",
    reference: "Reference",
  },
  ar: {
    title: "حدث خطأ من جهتنا",
    body: "تعذّر تحميل المتجر. سلتك محفوظة على هذا الجهاز، فلن يضيع شيء. حاول مرة أخرى بعد لحظة.",
    retry: "حاول مرة أخرى",
    retrying: "جارٍ إعادة المحاولة…",
    home: "الذهاب إلى الصفحة الرئيسية",
    contactLead: "إذا تكرّرت المشكلة، راسلنا على",
    reference: "الرقم المرجعي",
  },
} as const;

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname() ?? "";
  const locale = /^\/ar(\/|$)/.test(pathname) ? "ar" : "en";
  const t = COPY[locale];
  const admin = pathname.startsWith("/admin");
  const home = admin ? "/admin" : `/${locale}`;
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${GeistSans.variable} ${GeistMono.variable} ${notoKufiArabic.variable} ${
        admin ? "" : "storefront"
      } h-full antialiased`}
    >
      <body className="flex min-h-full flex-col items-center justify-center gap-8 bg-background px-4 py-16 text-foreground">
        <title>{t.title}</title>
        {/* A plain <img>: the image optimizer may be part of what failed. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/pep-club-logo.png" alt="Pep Club" width={96} height={96} className="brand-mark size-16 object-contain" />
        <main
          role="alert"
          className="flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border border-border-strong bg-surface px-6 py-12 text-center shadow-sm"
        >
          <h1 className="text-balance font-serif text-xl font-semibold uppercase tracking-wide text-navy">
            {t.title}
          </h1>
          <p className="text-pretty text-muted">{t.body}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={pending}
              aria-busy={pending}
              onClick={() => startTransition(() => retry())}
              className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wide disabled:cursor-progress disabled:opacity-60"
            >
              {pending ? t.retrying : t.retry}
            </button>
            {/* A full page load, not a client navigation: the router state is what failed. */}
            <a
              href={home}
              className="btn-glass inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wide"
            >
              {t.home}
            </a>
          </div>
          <p className="mt-4 text-sm text-muted">
            {t.contactLead}{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-semibold text-accent underline underline-offset-2"
            >
              <bdi dir="ltr">{CONTACT.email}</bdi>
            </a>
          </p>
          {error.digest && (
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {t.reference}: <bdi dir="ltr" className="normal-case">{error.digest}</bdi>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
