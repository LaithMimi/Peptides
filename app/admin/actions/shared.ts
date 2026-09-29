// Shared result type and helpers for admin Server Actions. (No "use server"
// here: this module is imported by the action files, not exposed as an action.)

export type ActionState = {
  ok: boolean;
  /** Stable code: VALIDATION, UNAUTHORIZED, NOT_FOUND, HAS_ORDERS, SLUG_TAKEN, ... */
  code?: string;
  fieldErrors?: Record<string, string>;
  /** Id of the created/updated row. */
  id?: string;
};

export const INITIAL_STATE: ActionState = { ok: false };

/** True for a Postgres unique-violation error (code 23505), through driver wrappers. */
export function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

/** Which field a unique violation is about, judged from the constraint or message text. */
export function uniqueViolationField(error: unknown, fallback: string): string {
  // Only the constraint name and detail are inspected: the error message also
  // contains the whole SQL statement, which always mentions every column.
  const e = error as {
    constraint?: string;
    detail?: string;
    cause?: { constraint?: string; detail?: string };
  };
  const text = `${e?.constraint ?? ""} ${e?.detail ?? ""} ${e?.cause?.constraint ?? ""} ${e?.cause?.detail ?? ""}`;
  return text.includes("slug") ? "slug" : fallback;
}

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
