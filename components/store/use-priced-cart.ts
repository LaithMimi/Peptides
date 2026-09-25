"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useCart } from "@/lib/cart-store";
import { clampQuantity, totalsFrom, type Totals } from "@/lib/cart-math";
import { priceCartAction } from "@/app/[locale]/checkout/actions";
import type { PricedCart, PricedLine } from "@/lib/pricing";

export type DisplayLine = PricedLine & { pending?: boolean };

export interface UsePricedCart {
  lines: DisplayLine[];
  totals: Totals;
  empty: boolean;
  status: "idle" | "loading" | "error";
  canCheckout: boolean;
  maxLineQuantity: number;
  /** Server-recomputed cart from the last response (used to detect price changes). */
  server: PricedCart | null;
  retry: () => void;
  /** Adopt a fresh server cart (e.g. after a PRICE_CHANGED response). */
  adopt: (cart: PricedCart) => void;
}

/**
 * Prices the browser's cart (ids + quantities) on the server. Line totals and
 * the summary update instantly from the last server prices while quantities
 * change; a fresh server response then reconciles everything, so the server is
 * always the source of truth.
 */
export function usePricedCart(): UsePricedCart {
  const { items, setQuantity } = useCart();
  const locale = useLocale();
  // Last server prices (kept while a newer request is in flight, so the page
  // never blanks) and which request they answered.
  const [lastCart, setServer] = useState<PricedCart | null>(null);
  const [settled, setSettled] = useState<{ key: string; error: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);

  const requestKey = `${locale}|${attempt}|${JSON.stringify(items)}`;
  const server = items.length === 0 ? null : lastCart;
  const status: UsePricedCart["status"] =
    items.length === 0 || settled?.key === undefined
      ? items.length === 0
        ? "idle"
        : "loading"
      : settled.key !== requestKey
        ? "loading"
        : settled.error
          ? "error"
          : "idle";

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      priceCartAction(items, locale)
        .then((cart) => {
          if (cancelled) return;
          setServer(cart);
          setSettled({ key: requestKey, error: false });
          // The server's per-line maximum wins over what the browser stored.
          for (const item of items) {
            if (item.quantity > cart.maxLineQuantity) setQuantity(item.productId, cart.maxLineQuantity);
          }
        })
        .catch(() => {
          if (!cancelled) setSettled({ key: requestKey, error: true });
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [items, locale, requestKey, setQuantity]);

  const max = server?.maxLineQuantity ?? 10;

  const lines = useMemo<DisplayLine[]>(
    () =>
      items.map((item): DisplayLine => {
        const priced = server?.lines.find((l) => l.productId === item.productId);
        if (!priced) {
          return {
            productId: item.productId,
            name: "",
            brand: "",
            vialSize: null,
            imageUrl: null,
            href: null,
            unitPriceMinor: null,
            quantity: item.quantity,
            lineTotalMinor: null,
            status: "ok",
            pending: true,
          };
        }
        const quantity = clampQuantity(item.quantity, max);
        return {
          ...priced,
          quantity,
          lineTotalMinor: priced.unitPriceMinor === null ? null : priced.unitPriceMinor * quantity,
        };
      }),
    [items, server, max]
  );

  const totals = useMemo(
    () => totalsFrom(lines.filter((l) => !l.pending), server?.deliveryFeeIfAny ?? 0),
    [lines, server]
  );

  const canCheckout =
    status === "idle" &&
    lines.length > 0 &&
    lines.every((l) => !l.pending && l.status === "ok");

  return {
    lines,
    totals,
    empty: items.length === 0,
    status,
    canCheckout,
    maxLineQuantity: max,
    server,
    retry: () => setAttempt((n) => n + 1),
    adopt: (cart) => {
      setServer(cart);
      setSettled({ key: requestKey, error: false });
    },
  };
}
