// Money is stored and computed as integer agorot (ILS minor units). One
// currency only (spec assumptions); it is not a store setting.

export const CURRENCY = "ILS";
export const MAX_PRICE_MINOR = 10_000_000;

/** Formats agorot for display, e.g. 12550 -> "₪125.50". Arabic uses Latin digits. */
export function formatMoney(minor: number, locale: string): string {
  const tag = locale === "ar" ? "ar-u-nu-latn" : "en";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

/** Parses a decimal string typed by an admin ("125.5") into agorot, or null if invalid. */
export function toMinor(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

/** Agorot to a plain decimal string for form fields ("125.50"). */
export function fromMinor(minor: number): string {
  return (minor / 100).toFixed(2);
}
