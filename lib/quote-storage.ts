// Browser-side storage for the quote form (see specs/002-phone-signin-prefill).
// - profile: remembered details from the last submitted quote (localStorage)
// - draft: in-flight form values across the sign-in round trip (sessionStorage)
// Every call is safe when storage is blocked: reads return null, writes no-op.
// Notes and the 18+/research-use acknowledgment are never remembered.

const PROFILE_KEY = "pepclub.profile";
const DRAFT_KEY = "pepclub.quoteDraft";
const VERSION = 1;

export interface Profile {
  version: 1;
  phone: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
}

export interface Draft {
  version: 1;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  notes?: string | null;
}

function read(store: () => Storage, key: string): unknown {
  try {
    const raw = store().getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || data.version !== VERSION) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function write(store: () => Storage, key: string, value: unknown): void {
  try {
    store().setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — nothing is remembered
  }
}

function remove(store: () => Storage, key: string): void {
  try {
    store().removeItem(key);
  } catch {
    // ignore
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Older versions stored the address as separate fields; fold those into the
// single address line so remembered details keep working.
function toAddress(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const a = value as Record<string, unknown>;
    return [a.line1, a.line2, a.city, a.region, a.country]
      .filter((part): part is string => typeof part === "string" && part.trim() !== "")
      .join(", ");
  }
  return "";
}

export function readProfile(): Profile | null {
  const data = read(local, PROFILE_KEY) as Record<string, unknown> | null;
  if (!data || typeof data.phone !== "string" || !data.phone) return null;
  return {
    version: VERSION,
    phone: data.phone,
    customerName: str(data.customerName),
    customerEmail: str(data.customerEmail),
    shippingAddress: toAddress(data.shippingAddress),
  };
}

export function writeProfile(profile: Omit<Profile, "version">): void {
  // Explicit allow-list: never persist notes or the acknowledgment.
  write(local, PROFILE_KEY, {
    version: VERSION,
    phone: profile.phone,
    customerName: profile.customerName,
    customerEmail: profile.customerEmail,
    shippingAddress: toAddress(profile.shippingAddress),
  });
}

export function clearProfile(): void {
  remove(local, PROFILE_KEY);
}

export function readDraft(): Draft | null {
  const data = read(session, DRAFT_KEY) as Record<string, unknown> | null;
  if (!data) return null;
  return {
    version: VERSION,
    customerName: str(data.customerName),
    customerEmail: str(data.customerEmail),
    shippingAddress: toAddress(data.shippingAddress),
    notes: typeof data.notes === "string" ? data.notes : null,
  };
}

export function writeDraft(draft: Omit<Draft, "version">): void {
  write(session, DRAFT_KEY, {
    version: VERSION,
    customerName: draft.customerName,
    customerEmail: draft.customerEmail,
    shippingAddress: toAddress(draft.shippingAddress),
    notes: draft.notes ?? null,
  });
}

export function clearDraft(): void {
  remove(session, DRAFT_KEY);
}

/** Reads the draft and deletes it, so it is only ever restored once. */
export function takeDraft(): Draft | null {
  const draft = readDraft();
  clearDraft();
  return draft;
}
