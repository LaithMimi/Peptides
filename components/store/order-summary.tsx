"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EASE_OUT_EXPO, prefersReducedMotion } from "@/lib/motion";
import { formatMoney } from "@/lib/money";
import type { Totals } from "@/lib/cart-math";

/** Subtotal, delivery fee (or "Free") and total. All numbers come from the server's prices. */
export function OrderSummary({ totals }: { totals: Totals }) {
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

  return (
    <dl className="flex flex-col gap-2 rounded-xl border border-border-strong bg-surface-raised p-4">
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted">{t("subtotal")}</dt>
        <dd className="text-foreground">{money(totals.subtotalMinor)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted">{t("deliveryFee")}</dt>
        <dd className="text-foreground">
          {totals.deliveryFeeMinor === 0 ? t("freeDelivery") : money(totals.deliveryFeeMinor)}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-dashed border-border-strong pt-2">
        <dt className="font-serif text-base font-semibold uppercase tracking-wide text-navy">
          {t("total")}
        </dt>
        <dd ref={totalRef} className="origin-right rtl:origin-left text-lg font-semibold text-navy">
          {money(totals.totalMinor)}
        </dd>
      </div>
    </dl>
  );
}
