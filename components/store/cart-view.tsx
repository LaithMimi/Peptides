"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { CartLines } from "@/components/store/cart-lines";
import { OrderSummary } from "@/components/store/order-summary";
import { usePricedCart } from "@/components/store/use-priced-cart";
import { secondaryButtonClass } from "@/components/form-field";

export function CartView() {
  const t = useTranslations("cart");
  const { setQuantity, removeItem } = useCart();
  const cart = usePricedCart();

  if (cart.empty) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border-strong px-6 py-12 text-center">
        <h2 className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          {t("empty")}
        </h2>
        <p className="text-muted">{t("emptyHelp")}</p>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide text-navy-foreground hover:opacity-90"
        >
          {t("browse")}
        </Link>
      </div>
    );
  }

  const blocked = cart.lines.some((l) => !l.pending && l.status !== "ok");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="flex flex-col gap-4">
        {cart.status === "error" && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-danger-bg p-4 text-danger">
            <p className="flex-1">{t("loadFailed")}</p>
            <button type="button" onClick={cart.retry} className={secondaryButtonClass}>
              {t("retry")}
            </button>
          </div>
        )}
        {blocked && (
          <div role="alert" className="rounded-lg border-2 border-dashed border-border-strong p-4">
            <p className="font-serif text-sm font-semibold uppercase tracking-wide text-navy">
              {t("blockedTitle")}
            </p>
            <p className="mt-1 text-sm text-muted">{t("blockedBody")}</p>
          </div>
        )}
        <CartLines
          lines={cart.lines}
          maxQuantity={cart.maxLineQuantity}
          editable
          onQuantity={setQuantity}
          onRemove={removeItem}
        />
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6" aria-label={t("summary")}>
        <OrderSummary totals={cart.totals} />
        <p className="text-sm text-muted">{t("cashOnDelivery")}</p>
        <DisclaimerBanner variant="compact" />
        {cart.canCheckout ? (
          <Link
            href="/checkout"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-accent-foreground hover:opacity-90"
          >
            {t("checkout")}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-accent-foreground opacity-50"
          >
            {cart.status === "loading" ? t("updating") : t("checkout")}
          </button>
        )}
      </aside>
    </div>
  );
}
