"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { QuantityStepper } from "@/components/store/quantity-stepper";

/** How long the button reads "Added" before returning to "Add to cart". */
const CONFIRM_MS = 1800;

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
  // Counts adds: keys the check so a repeat add redraws it, and drives the
  // brief in-button confirmation. The button never disables, so adding again
  // stays one click.
  const [adds, setAdds] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

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
          setAdds((n) => n + 1);
          setConfirming(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setConfirming(false), CONFIRM_MS);
        }}
        className="btn-primary inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide sm:w-fit"
      >
        {/* Both labels share one grid cell, so the button keeps the wider
            label's width and never jumps when it swaps. The status line below
            carries the announcement; this swap is visual only. */}
        <span className="grid">
          <span
            className={`col-start-1 row-start-1 transition-opacity duration-150 ${
              confirming ? "opacity-0" : "opacity-100"
            }`}
          >
            {t("addToCart")}
          </span>
          <span
            aria-hidden="true"
            className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2 transition-opacity duration-150 ${
              confirming ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg key={adds} viewBox="0 0 16 16" fill="none" className="size-4 shrink-0">
              <path
                className={confirming ? "added-check" : undefined}
                d="M3 8.5l3.2 3L13 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
              />
            </svg>
            {t("addedShort")}
          </span>
        </span>
      </button>
      <p role="status" className="min-h-6 text-sm text-muted">
        {added && (
          <span key={adds} className="status-in inline-block">
            {t("added")}{" "}
            <Link href="/cart" className="font-semibold text-navy underline hover:text-accent">
              {t("viewCart")}
            </Link>
          </span>
        )}
      </p>
    </div>
  );
}
