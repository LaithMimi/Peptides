"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useEffect, useRef, useState, useTransition } from "react";

// Each language is named in its own script so it is recognisable regardless of
// the language the page is currently in.
const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  ar: "العربية",
};

/**
 * Language menu: a globe button that opens a list of languages. `locales` are
 * the languages enabled in admin Settings; with only one there is nothing to
 * switch. Switching keeps the same page, including its query string (filters,
 * `?purpose=`, order links), so nothing is lost.
 */
export function LocaleSwitcher({ locales }: { locales?: string[] }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const available = routing.locales.filter(
    (l) => !locales || locales.includes(l) || l === locale
  );
  if (available.length < 2) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="locale-menu"
        aria-label={`${t("language")}: ${LOCALE_NAMES[locale] ?? locale}`}
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-accent text-accent transition-colors hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.6 3.75 5.6 3.75 9S14.5 18.4 12 21c-2.5-2.6-3.75-5.6-3.75-9S9.5 5.6 12 3Z" />
        </svg>
      </button>

      {open && (
        <ul
          id="locale-menu"
          className="menu-panel absolute end-0 top-full z-50 mt-2 min-w-40 rounded-2xl p-1.5 shadow-lg"
        >
          {available.map((loc) => {
            const active = loc === locale;
            return (
              <li key={loc}>
                <button
                  type="button"
                  lang={loc}
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    setOpen(false);
                    if (active) return;
                    const query = Object.fromEntries(searchParams.entries());
                    startTransition(() => {
                      router.replace({ pathname, query }, { locale: loc });
                    });
                  }}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-start text-sm font-semibold transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-navy hover:text-accent"
                  }`}
                >
                  <span>{LOCALE_NAMES[loc] ?? loc}</span>
                  {active && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
