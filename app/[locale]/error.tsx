"use client";

import { useEffect, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/contact";
import { StatePanel } from "@/components/store/unavailable";
import { LtrValue } from "@/components/ltr-value";

/**
 * Shown when a storefront page fails to render (most often the database being
 * briefly unreachable). The header, footer and cart stay in place around it.
 * It never shows the error text itself: only the digest, which the store can
 * match against the server logs when a customer quotes it.
 */
export default function StorefrontError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errorPage");
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Move focus to the message so keyboard and screen-reader users land on it
  // rather than on whatever control they used to get here.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <StatePanel tone="failed" title={t("title")} body={t("body")} headingRef={headingRef}>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() => startTransition(() => retry())}
          className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide disabled:cursor-progress disabled:opacity-60"
        >
          {pending ? t("retrying") : t("retry")}
        </button>
        <Link
          href="/shop"
          className="btn-glass inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide"
        >
          {t("shop")}
        </Link>
      </div>
      <p className="mt-4 text-sm text-muted">
        {t("contactLead")}{" "}
        <a
          href={`mailto:${CONTACT.email}`}
          className="font-semibold text-accent underline underline-offset-2"
        >
          <LtrValue>{CONTACT.email}</LtrValue>
        </a>
      </p>
      {error.digest && (
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {t("reference")}: <LtrValue className="normal-case">{error.digest}</LtrValue>
        </p>
      )}
    </StatePanel>
  );
}
