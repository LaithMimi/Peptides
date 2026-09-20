"use client";

import { useTranslations } from "next-intl";
import { OPEN_SETTINGS_EVENT } from "@/lib/consent";

/** Footer control that reopens the consent banner so a choice can be changed. */
export function CookieSettingsButton({ className }: { className?: string }) {
  const t = useTranslations("legal.footer");
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      {t("cookieSettings")}
    </button>
  );
}
