// Localized DB fields are stored as paired camelCase columns (`nameEn`,
// `nameAr`). English is required; Arabic is optional. When the requested
// language is missing or blank the other language is used (spec FR-040).

export type FieldLocale = "en" | "ar";

const SUFFIX: Record<FieldLocale, string> = { en: "En", ar: "Ar" };

function asLocale(locale: string): FieldLocale {
  return locale === "ar" ? "ar" : "en";
}

function read(row: object, field: string, locale: FieldLocale): string | null {
  const value = (row as Record<string, unknown>)[`${field}${SUFFIX[locale]}`];
  if (typeof value !== "string") return null;
  return value.trim() === "" ? null : value;
}

/** Returns `field` in `locale`, falling back to the other language, else null. */
export function pick(row: object, field: string, locale: string): string | null {
  const primary = asLocale(locale);
  const other: FieldLocale = primary === "en" ? "ar" : "en";
  return read(row, field, primary) ?? read(row, field, other);
}

/** Like `pick` but never null. */
export function pickOr(
  row: object,
  field: string,
  locale: string,
  fallback = ""
): string {
  return pick(row, field, locale) ?? fallback;
}
