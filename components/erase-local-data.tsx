"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/[locale]/quote/otp-actions";
import { eraseLocalData } from "@/lib/consent";

/**
 * Self-serve erasure for this browser: ends the verified-phone session (drops
 * the cookie) and removes the cart, remembered details, draft and consent
 * choice. Data the business already holds is handled by the data request form.
 */
export function EraseLocalData() {
  const t = useTranslations("legal.erase");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function erase() {
    setBusy(true);
    try {
      await signOut();
    } catch {
      // still erase what is local
    }
    eraseLocalData();
    setBusy(false);
    setDone(true);
  }

  return (
    <div className="mt-6 rounded-xl border border-border-strong bg-surface-raised p-5">
      <h2 className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("body")}</p>
      <button
        type="button"
        onClick={erase}
        disabled={busy}
        className="mt-3 inline-flex items-center justify-center rounded-full border-2 border-navy bg-surface px-5 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-navy hover:bg-navy hover:text-navy-foreground disabled:opacity-60"
      >
        {t("button")}
      </button>
      {done && (
        <p role="status" className="mt-3 text-sm font-semibold text-navy">
          {t("done")}
        </p>
      )}
    </div>
  );
}
