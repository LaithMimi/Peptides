"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import type { Totals } from "@/lib/cart-math";

/** Subtotal, delivery fee (or "Free") and total. All numbers come from the server's prices. */
export function OrderSummary({ totals }: { totals: Totals }) {
  const t = useTranslations("cart");
  const locale = useLocale();
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
        <dd className="text-lg font-semibold text-navy">{money(totals.totalMinor)}</dd>
      </div>
    </dl>
  );
}
