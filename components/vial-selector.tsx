"use client";

import { useState } from "react";
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

  function handleAdd() {
    if (!selectedVialId) {
      setError(t("selectVialFirst"));
      setAdded(false);
      return;
    }
    setError(null);
    addItem({ productId, vialId: selectedVialId, quantity });
    setAdded(true);
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
      {added && !error && (
        <p role="status" className="text-sm font-medium text-accent">
          {t("addedToQuote")}
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex w-fit items-center justify-center rounded-full bg-accent px-5 py-2.5 font-serif text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
      >
        {t("addToQuote")}
      </button>
    </div>
  );
}
