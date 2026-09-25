// Pure cart arithmetic with no database imports, so the browser can use it to
// update totals instantly while the server stays the source of truth.

export type LineStatus = "ok" | "unpriced" | "unavailable";

export interface Totals {
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
}

/**
 * Subtotal, delivery fee and total. `deliveryFeeIfAny` is the fee from store
 * settings (already 0 when delivery is disabled); it applies only when there is
 * something to deliver. It is never hardcoded.
 */
export function totalsFrom(
  lines: { status: LineStatus; lineTotalMinor: number | null }[],
  deliveryFeeIfAny: number
): Totals {
  const subtotalMinor = lines.reduce(
    (sum, l) => (l.status === "ok" && l.lineTotalMinor !== null ? sum + l.lineTotalMinor : sum),
    0
  );
  const deliveryFeeMinor = subtotalMinor > 0 ? deliveryFeeIfAny : 0;
  return { subtotalMinor, deliveryFeeMinor, totalMinor: subtotalMinor + deliveryFeeMinor };
}

/** Clamps a requested quantity to 1..max. */
export function clampQuantity(quantity: number, max: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(max, Math.floor(quantity)));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID.test(value);
