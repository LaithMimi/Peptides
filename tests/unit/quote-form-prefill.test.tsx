import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QuoteForm } from "@/components/quote-form";
import { writeDraft, writeProfile } from "@/lib/quote-storage";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/cart-store", () => ({
  useCart: () => ({
    items: [{ productId: "tb-500", vialId: "10mg", quantity: 1 }],
    clear: vi.fn(),
  }),
}));
vi.mock("@/app/[locale]/quote/actions", () => ({
  submitQuoteRequest: vi.fn(),
}));
vi.mock("@/app/[locale]/quote/otp-actions", () => ({
  signOut: vi.fn(),
}));

const PHONE = "+14155552671";
const address = "123 Lab Way, Cambridge, United States";
const profile = {
  phone: PHONE,
  customerName: "Jane Researcher",
  customerEmail: "jane@example.com",
  shippingAddress: address,
};

function field(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("QuoteForm prefill", () => {
  it("prefills from the remembered profile when the session phone matches", () => {
    writeProfile(profile);
    render(<QuoteForm sessionPhone={PHONE} />);
    expect(field("customerName").value).toBe("Jane Researcher");
    expect(field("customerEmail").value).toBe("jane@example.com");
    expect(field("shippingAddress").value).toBe(address);
    expect(field("notes").value).toBe("");
    expect(
      (document.querySelector('input[type="checkbox"]') as HTMLInputElement)
        .checked
    ).toBe(false);
  });

  it("does not prefill for a different session phone", () => {
    writeProfile(profile);
    render(<QuoteForm sessionPhone="+14155552672" />);
    expect(field("customerName").value).toBe("");
    expect(field("shippingAddress").value).toBe("");
  });

  it("does not prefill a signed-out visitor", () => {
    writeProfile(profile);
    render(<QuoteForm sessionPhone={null} />);
    expect(field("customerName").value).toBe("");
    expect(screen.getByText("phoneVerifiedOnSubmit")).toBeTruthy();
  });

  it("lets typed draft values win over remembered ones", () => {
    writeProfile(profile);
    writeDraft({
      customerName: "Typed Name",
      customerEmail: "",
      shippingAddress: "9 Typed St, Boston",
      notes: "call me",
    });
    render(<QuoteForm sessionPhone={PHONE} />);
    expect(field("customerName").value).toBe("Typed Name");
    // Empty in the draft, so the remembered value fills the gap.
    expect(field("customerEmail").value).toBe("jane@example.com");
    expect(field("shippingAddress").value).toBe("9 Typed St, Boston");
    expect(field("notes").value).toBe("call me");
    // The draft is consumed exactly once.
    expect(window.sessionStorage.getItem("pepclub.quoteDraft")).toBeNull();
  });

  it("renders empty and does not throw on a corrupt profile", () => {
    window.localStorage.setItem("pepclub.profile", "{not json");
    expect(() => render(<QuoteForm sessionPhone={PHONE} />)).not.toThrow();
    expect(field("customerName").value).toBe("");
  });
});
