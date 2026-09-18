import { describe, expect, it } from "vitest";
import { quoteRequestSchema } from "@/lib/quote-schema";

const validInput = {
  lineItems: [{ productId: "tb-500", vialId: "10mg", quantity: 2 }],
  customerName: "Jane Researcher",
  customerEmail: "jane@example.com",
  customerPhone: null,
  country: "United States",
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

  it("rejects quantity above 20", () => {
    const result = quoteRequestSchema.safeParse({
      ...validInput,
      lineItems: [{ productId: "tb-500", vialId: "10mg", quantity: 21 }],
    });
    expect(result.success).toBe(false);
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
    const result = quoteRequestSchema.safeParse({ ...validInput, country: "" });
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
