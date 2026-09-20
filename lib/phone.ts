import { parsePhoneNumberFromString } from "libphonenumber-js";

/** Returns the E.164 form of a valid international number, else null. */
export function parsePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("+")) return null;
  const parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}
