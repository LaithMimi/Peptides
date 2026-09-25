import { describe, expect, it } from "vitest";
import { whatsappDigits, whatsappLink } from "@/lib/whatsapp";

describe("whatsappLink", () => {
  it("keeps only digits of the configured number", () => {
    expect(whatsappLink("+972 58-711-4119")).toBe("https://wa.me/972587114119");
    expect(whatsappDigits("(972) 587114119")).toBe("972587114119");
  });

  it("prefills an English message with the product name, URL-encoded", () => {
    const url = whatsappLink("972587114119", "Hi, I would like to know the price of TB-500.")!;
    expect(url.startsWith("https://wa.me/972587114119?text=")).toBe(true);
    const text = new URL(url).searchParams.get("text");
    expect(text).toBe("Hi, I would like to know the price of TB-500.");
  });

  it("round-trips an Arabic message", () => {
    const message = "مرحبًا، أود معرفة سعر TB-500.";
    const url = whatsappLink("972587114119", message)!;
    expect(new URL(url).searchParams.get("text")).toBe(message);
    expect(url).not.toContain(" ");
  });

  it("encodes characters that would break the query string", () => {
    const url = whatsappLink("972587114119", "A&B=C #1?")!;
    expect(new URL(url).searchParams.get("text")).toBe("A&B=C #1?");
  });

  it("returns null when no usable number is set", () => {
    for (const value of [null, undefined, "", "   ", "abc", "123"]) {
      expect(whatsappLink(value as string | null)).toBeNull();
      expect(whatsappLink(value as string | null, "hi")).toBeNull();
    }
  });
});
