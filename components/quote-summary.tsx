"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { getProductById } from "@/lib/products";
import { MAX_LINE_QUANTITY } from "@/lib/quote-schema";
import { LtrValue } from "@/components/ltr-value";
import type { Locale } from "@/i18n/routing";

export function QuoteSummary({ showLink = true }: { showLink?: boolean }) {
  const t = useTranslations("quoteCart");
  const locale = useLocale() as Locale;
  const { items, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border-strong p-6 text-center">
        <p className="text-muted">{t("empty")}</p>
        <Link
          href="/"
          className="mt-3 inline-block font-serif text-sm font-semibold text-accent hover:underline"
        >
          {t("browseCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-strong bg-surface p-5">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
        {t("itemsTitle")}
      </h2>
      <ul className="flex flex-col divide-y divide-dashed divide-border">
        {items.map((item) => {
          const product = getProductById(item.productId);
          const vial = product?.vials.find((v) => v.id === item.vialId);
          if (!product || !vial) return null;
          const translation = product.translations[locale];
          return (
            <li
              key={`${item.productId}-${item.vialId}`}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="font-serif font-semibold uppercase tracking-wide text-navy">
                  {product.name}
                </p>
                <p className="font-mono text-xs text-muted">
                  <LtrValue>{vial.label}</LtrValue> · {translation.tagline}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`qty-${item.productId}-${item.vialId}`}>
                  {t("quantity")}
                </label>
                <input
                  id={`qty-${item.productId}-${item.vialId}`}
                  type="number"
                  min={1}
                  max={MAX_LINE_QUANTITY}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.productId,
                      item.vialId,
                      Number(e.target.value) || 1
                    )
                  }
                  className="min-h-11 w-20 rounded-md border border-input-border bg-surface-raised px-2 py-1 font-mono text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.vialId)}
                  className="inline-flex min-h-11 items-center px-2 font-mono text-xs font-semibold uppercase tracking-wide text-danger hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {t("remove")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {showLink && (
        <Link
          href="/quote"
          className="mt-2 inline-flex w-fit items-center justify-center min-h-11 rounded-full bg-navy px-5 py-2.5 font-serif text-sm font-semibold uppercase tracking-wide text-navy-foreground transition-opacity hover:opacity-90"
        >
          {t("goToQuote")}
        </Link>
      )}
    </div>
  );
}
