"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ar: "AR",
};

export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border-2 border-navy bg-surface p-1"
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                router.replace(pathname, { locale: loc });
              });
            }}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wide transition-colors ${
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
