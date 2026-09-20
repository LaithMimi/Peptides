"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Vial } from "@/types/catalog";
import { useCart } from "@/lib/cart-store";
import { MAX_LINE_QUANTITY } from "@/lib/quote-schema";
import { LtrValue } from "@/components/ltr-value";

export function VialSelector({
  productId,
  vials,
}: {
  productId: string;
  vials: Vial[];
}) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const [selectedVialId, setSelectedVialId] = useState<string>(
    vials.length === 1 ? vials[0].id : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  // Bumped on every add so repeated adds restart the auto-dismiss timer.
  const [addCount, setAddCount] = useState(0);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [added, addCount]);

  function handleAdd() {
    if (!selectedVialId) {
      setError(t("selectVialFirst"));
      setAdded(false);
      return;
    }
    setError(null);
    addItem({ productId, vialId: selectedVialId, quantity });
    setAdded(true);
    setAddCount((n) => n + 1);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-surface p-5">
      <fieldset>
        <legend className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          {t("selectVial")}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {vials.map((vial) => {
            const active = vial.id === selectedVialId;
            return (
              <label
                key={vial.id}
                className={`cursor-pointer rounded-full border-2 px-4 py-2 font-serif text-sm font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? "border-navy bg-navy text-navy-foreground"
                    : "border-border-strong bg-surface-raised text-navy hover:border-navy"
                }`}
              >
                <input
                  type="radio"
                  name={`vial-${productId}`}
                  value={vial.id}
                  checked={active}
                  onChange={() => {
                    setSelectedVialId(vial.id);
                    setError(null);
                    setAdded(false);
                  }}
                  className="sr-only"
                />
                <LtrValue>{vial.label}</LtrValue>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <label
          htmlFor="quantity"
          className="font-mono text-xs font-semibold uppercase tracking-widest text-muted"
        >
          {t("quantityLabel")}
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={MAX_LINE_QUANTITY}
          value={quantity}
          onChange={(e) => {
            const next = Number(e.target.value);
            setQuantity(
              Number.isFinite(next)
                ? Math.max(1, Math.min(MAX_LINE_QUANTITY, next))
                : 1
            );
            setAdded(false);
          }}
          className="w-20 rounded-md border border-border-strong bg-surface-raised px-3 py-1.5 font-mono text-foreground"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className={`inline-flex w-fit items-center justify-center gap-2 rounded-full px-5 py-2.5 font-serif text-sm font-semibold uppercase tracking-wide transition-colors ${
          added
            ? "bg-navy text-navy-foreground"
            : "bg-accent text-accent-foreground hover:opacity-90"
        }`}
      >
        {added && (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 10.5l4 4 8-9" />
          </svg>
        )}
        {added ? t("added") : t("addToQuote")}
      </button>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center"
      >
        {added && !error && (
          <p className="toast-in rounded-full border border-border-strong bg-navy px-5 py-3 text-sm font-medium text-navy-foreground shadow-lg">
            {t("addedToQuote")}
          </p>
        )}
      </div>
    </div>
  );
}
