import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDraft,
  clearProfile,
  readDraft,
  readProfile,
  takeDraft,
  writeDraft,
  writeProfile,
} from "@/lib/quote-storage";

const address = "123 Lab Way, Cambridge, United States";

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("profile", () => {
  const profile = {
    phone: "+14155552671",
    customerName: "Jane",
    customerEmail: "jane@example.com",
    shippingAddress: address,
  };

  it("round-trips and replaces the previous profile", () => {
    writeProfile(profile);
    expect(readProfile()).toMatchObject(profile);
    writeProfile({ ...profile, customerName: "Jane Q" });
    expect(readProfile()?.customerName).toBe("Jane Q");
  });

  it("never stores notes or the acknowledgment", () => {
    writeProfile({
      ...profile,
      notes: "secret",
      ageAndResearchUseAck: true,
    } as never);
    const raw = window.localStorage.getItem("pepclub.profile") ?? "";
    expect(raw).not.toContain("notes");
    expect(raw).not.toContain("ageAndResearchUseAck");
  });

  it("clears", () => {
    writeProfile(profile);
    clearProfile();
    expect(readProfile()).toBeNull();
  });

  it("treats corrupt or wrong-version data as absent", () => {
    window.localStorage.setItem("pepclub.profile", "{not json");
    expect(readProfile()).toBeNull();
    window.localStorage.setItem(
      "pepclub.profile",
      JSON.stringify({ version: 99, phone: "+14155552671" })
    );
    expect(readProfile()).toBeNull();
  });
});

describe("draft", () => {
  const draft = {
    customerName: "Jane",
    customerEmail: "jane@example.com",
    shippingAddress: address,
    notes: "hello",
  };

  it("round-trips, and takeDraft deletes after reading", () => {
    writeDraft(draft);
    expect(readDraft()).toMatchObject(draft);
    expect(takeDraft()).toMatchObject(draft);
    expect(readDraft()).toBeNull();
  });

  it("never stores the acknowledgment or a phone", () => {
    writeDraft({
      ...draft,
      ageAndResearchUseAck: true,
      customerPhone: "+14155552671",
    } as never);
    const raw = window.sessionStorage.getItem("pepclub.quoteDraft") ?? "";
    expect(raw).not.toContain("ageAndResearchUseAck");
    expect(raw).not.toContain("customerPhone");
  });

  it("clears", () => {
    writeDraft(draft);
    clearDraft();
    expect(readDraft()).toBeNull();
  });
});

describe("blocked storage", () => {
  it("never throws when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readProfile()).toBeNull();
    expect(readDraft()).toBeNull();
    expect(() =>
      writeProfile({
        phone: "+14155552671",
        customerName: "x",
        customerEmail: "x@x.com",
        shippingAddress: address,
      })
    ).not.toThrow();
    expect(() => clearProfile()).not.toThrow();
    expect(takeDraft()).toBeNull();
  });
});

describe("legacy multi-field address", () => {
  it("folds a stored address object into one line", () => {
    window.localStorage.setItem(
      "pepclub.profile",
      JSON.stringify({
        version: 1,
        phone: "+14155552671",
        customerName: "Jane",
        customerEmail: "jane@example.com",
        shippingAddress: {
          line1: "123 Lab Way",
          line2: "",
          city: "Cambridge",
          region: "MA",
          postalCode: "02139",
          country: "United States",
        },
      })
    );
    expect(readProfile()?.shippingAddress).toBe(
      "123 Lab Way, Cambridge, MA, United States"
    );
  });
});
