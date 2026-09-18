"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { getProductById } from "@/lib/products";
import type { Locale } from "@/i18n/routing";

export function QuoteSummary({ showLink = true }: { showLink?: boolean }) {
  const t = useTranslations("quoteCart");
  const locale = useLocale() as Locale;
  const { items, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-muted">{t("empty")}</p>
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          {t("browseCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-foreground">{t("itemsTitle")}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const product = getProductById(item.productId);
          const vial = product?.vials.find((v) => v.id === item.vialId);
          if (!product || !vial) return null;
          const translation = product.translations[locale];
          return (
            <li
              key={`${item.productId}-${item.vialId}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted">
                  {vial.label} · {translation.tagline}
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
                  max={20}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.productId,
                      item.vialId,
                      Number(e.target.value) || 1
                    )
                  }
                  className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.vialId)}
                  className="text-sm font-medium text-danger hover:underline"
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
          className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("goToQuote")}
        </Link>
      )}
    </div>
  );
}
