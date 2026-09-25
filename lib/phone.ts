import { parsePhoneNumberFromString } from "libphonenumber-js";

/** Returns the E.164 form of a valid international number, else null. */
export function parsePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("+")) return null;
  const parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

const ARABIC_INDIC = /[٠-٩]/g;
const EXTENDED_ARABIC_INDIC = /[۰-۹]/g;

/** Converts Arabic-Indic and Persian digits to Latin digits. */
export function normalizeDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EXTENDED_ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Customer phone for delivery: accepts international (+972...) or local
 * (05x...) numbers, with Arabic-Indic digits. Returns E.164 or null. Local
 * numbers are tried as Israeli then Palestinian.
 */
export function parseCustomerPhone(input: string): string | null {
  const normalized = normalizeDigits(input).trim();
  if (normalized === "") return null;
  for (const country of ["IL", "PS"] as const) {
    const parsed = parsePhoneNumberFromString(normalized, country);
    if (parsed?.isValid()) return parsed.number;
  }
  return null;
}
