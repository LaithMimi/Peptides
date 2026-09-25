"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ar: "AR",
};

/**
 * Language toggle. `locales` are the languages enabled in admin Settings; with
 * only one there is nothing to switch. Switching keeps the same page, including
 * its query string (filters, `?purpose=`, order links), so nothing is lost.
 */
export function LocaleSwitcher({ locales }: { locales?: string[] }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const available = routing.locales.filter(
    (l) => !locales || locales.includes(l) || l === locale
  );
  if (available.length < 2) return null;

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border-2 border-navy bg-surface p-1"
      role="group"
      aria-label={t("language")}
    >
      {available.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            disabled={isPending}
            onClick={() => {
              const query = Object.fromEntries(searchParams.entries());
              startTransition(() => {
                router.replace({ pathname, query }, { locale: loc });
              });
            }}
            aria-pressed={active}
            className={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-full px-3 font-mono text-xs font-semibold tracking-wide transition-colors ${
              active
                ? "bg-navy text-navy-foreground"
                : "text-muted hover:text-navy"
            }`}
          >
            {LOCALE_LABELS[loc] ?? loc}
          </button>
        );
      })}
    </div>
  );
}
