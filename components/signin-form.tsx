"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/lib/cart-store";
import { PhoneVerification } from "@/components/phone-verification";

export function SigninForm() {
  const t = useTranslations("signIn");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { items } = useCart();

  // The destination is derived, never taken from a URL parameter: back to the
  // quote request if there is something to submit, otherwise the catalog.
  function handleSignedIn() {
    router.push(items.length > 0 ? "/quote" : "/");
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border-strong bg-surface p-5 sm:p-6">
      <div>
        <h1 className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("intro")}</p>
      </div>

      <PhoneVerification locale={locale} onSignedIn={handleSignedIn} />

      <p className="text-xs text-muted">{t("cookieNote")}</p>

      <Link
        href="/quote"
        className="w-fit font-serif text-sm font-semibold text-accent hover:underline"
      >
        {t("backToQuote")}
      </Link>
    </div>
  );
}
