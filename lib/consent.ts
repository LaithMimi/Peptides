// Browser-side cookie/storage consent. "Essential" storage (the signed-in
// cookie, the quote cart, the language route) needs no consent and is always
// on. The one optional item is remembering name/email/address between visits;
// it only happens after the visitor has said yes here.
// Every call is safe when storage is blocked.

const CONSENT_KEY = "pepclub.consent";
export const CONSENT_EVENT = "pepclub:consent-change";
export const OPEN_SETTINGS_EVENT = "pepclub:open-cookie-settings";

export type ConsentChoice = "all" | "essential";

export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
    // Withdrawing consent also removes what it allowed.
    if (choice === "essential") window.localStorage.removeItem("pepclub.profile");
  } catch {
    // storage unavailable — the banner will simply show again
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** True only if the visitor explicitly allowed optional storage. */
export function hasOptionalConsent(): boolean {
  return readConsent() === "all";
}

/** Removes everything this site has stored in this browser (not the cookie). */
export function eraseLocalData(): void {
  try {
    for (const k of Object.keys(window.localStorage)) {
      if (k.startsWith("pepclub") || k.startsWith("peptides:")) {
        window.localStorage.removeItem(k);
      }
    }
    for (const k of Object.keys(window.sessionStorage)) {
      if (k.startsWith("pepclub")) window.sessionStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
