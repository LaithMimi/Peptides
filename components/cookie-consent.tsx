"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CONSENT_EVENT,
  OPEN_SETTINGS_EVENT,
  readConsent,
  writeConsent,
} from "@/lib/consent";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// "unknown" on the server and during hydration so the banner never flashes
// for a visitor who has already chosen.
const getSnapshot = () => readConsent() ?? "none";
const getServerSnapshot = () => "unknown";

// Both buttons share one style on purpose: declining must be exactly as easy
// and as visible as accepting.
const choiceClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border-2 border-accent bg-surface px-4 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-accent-foreground";

export function CookieConsent() {
  const t = useTranslations("legal.banner");
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  if (state === "unknown" || (state !== "none" && !reopened)) return null;

  function choose(choice: "all" | "essential") {
    writeConsent(choice);
    setReopened(false);
  }

  return (
    <section
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-accent bg-surface shadow-lg"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
        <p className="max-w-2xl text-xs text-foreground sm:text-sm">
          {t("body")}{" "}
          <Link
            href="/legal/cookies"
            className="font-semibold text-accent underline underline-offset-2"
          >
            {t("learnMore")}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={choiceClass} onClick={() => choose("essential")}>
            {t("essentialOnly")}
          </button>
          <button type="button" className={choiceClass} onClick={() => choose("all")}>
            {t("acceptAll")}
          </button>
        </div>
      </div>
    </section>
  );
}
