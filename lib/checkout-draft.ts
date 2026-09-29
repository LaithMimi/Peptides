// Keeps what the customer has typed at checkout across a language switch or an
// accidental reload. sessionStorage only (gone when the tab closes). The
// 18+/research-use acknowledgment and the order notes are never kept.
// Every call is safe when storage is blocked.

const KEY = "pepclub.checkoutDraft";

export interface CheckoutDraft {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
}

const str = (v: unknown): string => (typeof v === "string" ? v.slice(0, 500) : "");

export function readDraft(): CheckoutDraft | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown> | null;
    if (!data || typeof data !== "object") return null;
    const draft = {
      customerName: str(data.customerName),
      customerPhone: str(data.customerPhone),
      deliveryAddress: str(data.deliveryAddress),
    };
    return draft.customerName || draft.customerPhone || draft.deliveryAddress ? draft : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: Partial<CheckoutDraft>): void {
  try {
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify({
        customerName: str(draft.customerName),
        customerPhone: str(draft.customerPhone),
        deliveryAddress: str(draft.deliveryAddress),
      })
    );
  } catch {
    // storage unavailable: nothing is kept
  }
}

export function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
