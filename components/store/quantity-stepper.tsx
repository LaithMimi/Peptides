"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { EASE_OUT_EXPO, prefersReducedMotion } from "@/lib/motion";

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
  const outputRef = useRef<HTMLOutputElement>(null);
  const previous = useRef(value);

  // The digit ticks in from the direction of the change: up for more, down
  // for fewer, so the press and its result read as one motion.
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (from === value || prefersReducedMotion()) return;
    const offset = value > from ? "45%" : "-45%";
    outputRef.current?.animate(
      [
        { transform: `translateY(${offset})`, opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 220, easing: EASE_OUT_EXPO }
    );
  }, [value]);

  const buttonClass =
    "inline-flex size-11 items-center justify-center btn-glass rounded-full font-mono text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-40";

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
        ref={outputRef}
        aria-live="polite"
        className="inline-block min-w-8 text-center font-mono text-base font-semibold text-navy"
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
