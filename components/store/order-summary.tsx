"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EASE_OUT_EXPO, prefersReducedMotion } from "@/lib/motion";
import { formatMoney } from "@/lib/money";
import type { Totals } from "@/lib/cart-math";

/**
 * Subtotal, delivery fee (or "Free") and total. All numbers come from the
 * server's prices. Until the first prices arrive (`state="loading"`), or if
 * they could not be fetched (`"failed"`), no figure is shown at all: a
 * placeholder ₪0.00 total or a "Free" delivery fee would be a false statement.
 */
export function OrderSummary({
  totals,
  state = "ready",
}: {
  totals: Totals;
  state?: "ready" | "loading" | "failed";
}) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const totalRef = useRef<HTMLElement>(null);
  const previous = useRef(totals.totalMinor);

  // When a quantity edit reprices the cart, the total briefly lights in the
  // accent so the visitor sees where their change landed. Skipped while the
  // first server prices arrive (from 0).
  useEffect(() => {
    const from = previous.current;
    previous.current = totals.totalMinor;
    if (from === totals.totalMinor || from === 0 || prefersReducedMotion()) return;
    totalRef.current?.animate(
      [
        { color: "var(--accent)", transform: "scale(1.06)" },
        { color: "var(--navy)", transform: "scale(1)" },
      ],
      { duration: 520, easing: EASE_OUT_EXPO }
    );
  }, [totals.totalMinor]);

  const money = (minor: number) => (
    <bdi dir="ltr" className="font-mono">
      {formatMoney(minor, locale)}
    </bdi>
  );
  const unknown = (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-16 rounded bg-navy/10 align-middle ${
        state === "loading" ? "motion-safe:animate-pulse" : ""
      }`}
    />
  );
  const figure = (node: React.ReactNode) => (state === "ready" ? node : unknown);

  return (
    <dl
      aria-busy={state === "loading"}
      className="flex flex-col gap-2 rounded-xl border border-border-strong bg-surface-raised p-4"
    >
      {state !== "ready" && (
        <span className="sr-only">{state === "loading" ? t("updating") : t("summaryUnavailable")}</span>
      )}
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted">{t("subtotal")}</dt>
        <dd className="text-foreground">{figure(money(totals.subtotalMinor))}</dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted">{t("deliveryFee")}</dt>
        <dd className="text-foreground">
          {figure(totals.deliveryFeeMinor === 0 ? t("freeDelivery") : money(totals.deliveryFeeMinor))}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-dashed border-border-strong pt-2">
        <dt className="font-serif text-base font-semibold uppercase tracking-wide text-navy">
          {t("total")}
        </dt>
        <dd ref={totalRef} className="origin-right rtl:origin-left text-lg font-semibold text-navy">
          {figure(money(totals.totalMinor))}
        </dd>
      </div>
    </dl>
  );
}
