import { describe, expect, it } from "vitest";
import { quoteRequestSchema } from "@/lib/quote-schema";

const validInput = {
  lineItems: [{ productId: "tb-500", vialId: "10mg", quantity: 2 }],
  customerName: "Jane Researcher",
  customerEmail: "jane@example.com",
  customerPhone: "+14155552671",
  phoneVerificationToken: "signed-token-placeholder",
  shippingAddress: {
    line1: "123 Lab Way",
    line2: null,
    city: "Cambridge",
    region: "MA",
    postalCode: "02139",
    country: "United States",
  },
  notes: null,
  ageAndResearchUseAck: true as const,
  locale: "en" as const,
};

describe("quoteRequestSchema", () => {
  it("accepts a fully valid quote request", () => {
    const result = quoteRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects an empty line-item list", () => {
    const result = quoteRequestSchema.safeParse({ ...validInput, lineItems: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a line item referencing an unknown product", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      lineItems: [{ productId: "does-not-exist", vialId: "10mg", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a line item referencing an unknown vial on a real product", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      lineItems: [{ productId: "tb-500", vialId: "999mg", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects quantity below 1", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      lineItems: [{ productId: "tb-500", vialId: "10mg", quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts the maximum quantity of 10", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      lineItems: [{ productId: "tb-500", vialId: "10mg", quantity: 10 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects quantity above 10", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      lineItems: [{ productId: "tb-500", vialId: "10mg", quantity: 11 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate product+vial line items", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      lineItems: [
        { productId: "tb-500", vialId: "10mg", quantity: 1 },
        { productId: "tb-500", vialId: "10mg", quantity: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty honeypot field", () => {
    const result = quoteRequestSchema.safeParse({ ...validInput, website: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      customerEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty customer name", () => {
    const result = quoteRequestSchema.safeParse({ ...validInput, customerName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty country", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      shippingAddress: { ...validInput.shippingAddress, country: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing phone number", () => {
    const result = quoteRequestSchema.safeParse({ ...validInput, customerPhone: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that is not a valid international number", () => {
    for (const bad of ["4155552671", "+1", "abc"]) {
      const result = quoteRequestSchema.safeParse({
        ...validInput,
        customerPhone: bad,
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects a missing phone verification token", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      phoneVerificationToken: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an incomplete shipping address", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      shippingAddress: { ...validInput.shippingAddress, line1: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects submission when the acknowledgment is false", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      ageAndResearchUseAck: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects submission when the acknowledgment is missing", () => {
    const rest: Record<string, unknown> = { ...validInput };
    delete rest.ageAndResearchUseAck;
    const result = quoteRequestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("never validates a price field, because none exists on the schema", () => {
    // Guards against price ever silently re-entering the model (constitution
    // Principle V: no published pricing).
    expect("price" in quoteRequestSchema.shape).toBe(false);
  });
});
