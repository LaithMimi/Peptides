"use client";

import { useTranslations } from "next-intl";

/**
 * Touch-friendly quantity control ([-] 3 [+]). `name` is the product name, used
 * for accessible button labels. Bounds: min (default 1) to max.
 */
export function QuantityStepper({
  value,
  onChange,
  max,
  min = 1,
  name,
}: {
  value: number;
  onChange: (next: number) => void;
  max: number;
  min?: number;
  name: string;
}) {
  const t = useTranslations("cart");
  const buttonClass =
    "inline-flex size-11 items-center justify-center rounded-full border-2 border-navy font-mono text-lg font-semibold text-navy transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={t("quantityFor", { name })}>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t("decrease", { name })}
      >
        <span aria-hidden="true">−</span>
      </button>
      <output
        aria-live="polite"
        className="min-w-8 text-center font-mono text-base font-semibold text-navy"
      >
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t("increase", { name })}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
