"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Vial } from "@/types/catalog";
import { useCart } from "@/lib/cart-store";

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
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          {t("selectVial")}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {vials.map((vial) => {
            const active = vial.id === selectedVialId;
            return (
              <label
                key={vial.id}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:border-primary"
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
                {vial.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium text-foreground">
          {t("quantityLabel")}
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={20}
          value={quantity}
          onChange={(e) => {
            const next = Number(e.target.value);
            setQuantity(Number.isFinite(next) ? Math.max(1, Math.min(20, next)) : 1);
            setAdded(false);
          }}
          className="w-20 rounded-md border border-border bg-surface px-3 py-1.5 text-foreground"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {added && !error && (
        <p role="status" className="text-sm text-primary">
          {t("addedToQuote")}
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex w-fit items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        {t("addToQuote")}
      </button>
    </div>
  );
}
