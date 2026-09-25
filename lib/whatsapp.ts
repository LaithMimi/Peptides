/** Digits only, or null when the number is empty or not plausible (8 to 15 digits). */
export function whatsappDigits(number: string | null | undefined): string | null {
  const digits = (number ?? "").replace(/\D/g, "");
  return /^\d{8,15}$/.test(digits) ? digits : null;
}

/**
 * `https://wa.me/<digits>` with an optional prefilled message. Returns null when
 * no usable number is configured, so callers render nothing instead of a broken link.
 */
export function whatsappLink(
  number: string | null | undefined,
  message?: string
): string | null {
  const digits = whatsappDigits(number);
  if (!digits) return null;
  return message
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${digits}`;
}
