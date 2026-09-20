import { beforeEach, describe, expect, it } from "vitest";
import {
  eraseLocalData,
  hasOptionalConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";
import { readProfile, writeProfile } from "@/lib/quote-storage";
import { dataRequestFormSchema } from "@/lib/data-request-schema";

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("consent", () => {
  it("has no optional consent until the visitor chooses", () => {
    expect(readConsent()).toBeNull();
    expect(hasOptionalConsent()).toBe(false);
  });

  it("only 'all' allows optional storage", () => {
    writeConsent("essential");
    expect(hasOptionalConsent()).toBe(false);
    writeConsent("all");
    expect(hasOptionalConsent()).toBe(true);
  });

  it("choosing essential-only removes remembered details", () => {
    writeProfile({
      phone: "+14155552671",
      customerName: "Jane",
      customerEmail: "jane@example.com",
      shippingAddress: "1 Lab Way",
    });
    writeConsent("essential");
    expect(readProfile()).toBeNull();
  });

  it("eraseLocalData removes everything this site stored", () => {
    window.localStorage.setItem("peptides:quote-cart", "[]");
    window.localStorage.setItem("pepclub.consent", "all");
    window.localStorage.setItem("unrelated", "keep");
    window.sessionStorage.setItem("pepclub.quoteDraft", "{}");
    eraseLocalData();
    expect(window.localStorage.getItem("peptides:quote-cart")).toBeNull();
    expect(readConsent()).toBeNull();
    expect(window.sessionStorage.getItem("pepclub.quoteDraft")).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep");
  });
});

describe("data request schema", () => {
  const base = { type: "delete", email: "a@b.co", phone: "", details: "", website: "" };

  it("accepts a valid request", () => {
    expect(dataRequestFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a bad email with a translatable code", () => {
    const r = dataRequestFormSchema.safeParse({ ...base, email: "nope" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("invalidEmail");
  });

  it("rejects an unknown request type", () => {
    expect(dataRequestFormSchema.safeParse({ ...base, type: "sell" }).success).toBe(false);
  });
});
