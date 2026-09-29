import { beforeEach, describe, expect, it } from "vitest";
import {
  eraseLocalData,
  hasOptionalConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";
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

  it("choosing essential-only removes legacy remembered details", () => {
    window.localStorage.setItem("pepclub.profile", '{"version":1}');
    writeConsent("essential");
    expect(window.localStorage.getItem("pepclub.profile")).toBeNull();
  });

  it("eraseLocalData removes everything this site stored", () => {
    window.localStorage.setItem("peptides:cart", "[]");
    window.localStorage.setItem("pepclub.consent", "all");
    window.localStorage.setItem("unrelated", "keep");
    window.sessionStorage.setItem("pepclub.checkoutDraft", "{}");
    eraseLocalData();
    expect(window.localStorage.getItem("peptides:cart")).toBeNull();
    expect(readConsent()).toBeNull();
    expect(window.sessionStorage.getItem("pepclub.checkoutDraft")).toBeNull();
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
