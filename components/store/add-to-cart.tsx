"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { QuantityStepper } from "@/components/store/quantity-stepper";

/** Quantity selector + Add to Cart. Rendered only for priced products. */
export function AddToCart({
  productId,
  productName,
  maxQuantity,
}: {
  productId: string;
  productName: string;
  maxQuantity: number;
}) {
  const t = useTranslations("cart");
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          {t("quantity")}
        </span>
        <QuantityStepper
          value={quantity}
          onChange={(q) => {
            setQuantity(q);
            setAdded(false);
          }}
          max={maxQuantity}
          name={productName}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          addItem(productId, quantity);
          setAdded(true);
        }}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 sm:w-fit"
      >
        {t("addToCart")}
      </button>
      <p role="status" className="min-h-6 text-sm text-muted">
        {added && (
          <>
            {t("added")}{" "}
            <Link href="/cart" className="font-semibold text-navy underline hover:text-accent">
              {t("viewCart")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
