import { describe, expect, it } from "vitest";
import { placeOrderSchema, fieldErrorsFrom } from "@/lib/schemas/order";
import { normalizeDigits, parseCustomerPhone } from "@/lib/phone";

const ID = "3f0c3a3e-9a53-4c5b-9a3e-2c1f2b6d7a10";
const base = {
  idempotencyKey: ID,
  customerName: "Sara Khalil",
  customerPhone: "0501234567",
  deliveryAddress: "12 Main Street, Jerusalem",
  acknowledged: true,
  locale: "en",
  items: [{ productId: ID, quantity: 1 }],
};

function errors(overrides: Record<string, unknown>) {
  const result = placeOrderSchema.safeParse({ ...base, ...overrides });
  return result.success ? null : fieldErrorsFrom(result.error);
}

describe("placeOrderSchema", () => {
  it("accepts a valid order and normalizes the phone to E.164", () => {
    const result = placeOrderSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.customerPhone).toBe("+972501234567");
  });

  it("validates name length 2-120", () => {
    expect(errors({ customerName: "" })).toMatchObject({ customerName: "required" });
    expect(errors({ customerName: "A" })).toMatchObject({ customerName: "tooShort" });
    expect(errors({ customerName: "A".repeat(121) })).toMatchObject({ customerName: "tooLong" });
    expect(errors({ customerName: "A".repeat(120) })).toBeNull();
  });

  it("validates address length 5-500 and notes max 1000", () => {
    expect(errors({ deliveryAddress: "abcd" })).toMatchObject({ deliveryAddress: "tooShort" });
    expect(errors({ deliveryAddress: "a".repeat(501) })).toMatchObject({ deliveryAddress: "tooLong" });
    expect(errors({ notes: "n".repeat(1001) })).toMatchObject({ notes: "tooLong" });
    expect(errors({ notes: "n".repeat(1000) })).toBeNull();
    expect(errors({ notes: "" })).toBeNull();
  });

  it("rejects invalid phones with a code, not text", () => {
    expect(errors({ customerPhone: "12345" })).toMatchObject({ customerPhone: "invalidPhone" });
    expect(errors({ customerPhone: "abc" })).toMatchObject({ customerPhone: "invalidPhone" });
  });

  it("accepts international and Arabic-Indic digit numbers", () => {
    expect(parseCustomerPhone("+972 50 123 4567")).toBe("+972501234567");
    expect(parseCustomerPhone("٠٥٠١٢٣٤٥٦٧")).toBe("+972501234567");
    expect(normalizeDigits("۰۵٠")).toBe("050");
  });

  it("requires the acknowledgment to be literally true", () => {
    expect(errors({ acknowledged: false })).toMatchObject({ acknowledged: "ackRequired" });
    expect(errors({ acknowledged: undefined })).toMatchObject({ acknowledged: "ackRequired" });
  });

  it("validates lines: not empty, at most 30, no duplicates, quantity 1..100", () => {
    expect(errors({ items: [] })).toMatchObject({ items: "emptyCart" });
    const many = Array.from({ length: 31 }, () => ({ productId: crypto.randomUUID(), quantity: 1 }));
    expect(errors({ items: many })).toMatchObject({ items: "tooManyLines" });
    expect(
      errors({ items: [{ productId: ID, quantity: 1 }, { productId: ID, quantity: 2 }] })
    ).toMatchObject({ items: "duplicateItem" });
    expect(errors({ items: [{ productId: ID, quantity: 0 }] })).not.toBeNull();
    expect(errors({ items: [{ productId: ID, quantity: 101 }] })).not.toBeNull();
    expect(errors({ items: [{ productId: ID, quantity: 1.5 }] })).not.toBeNull();
  });

  it("requires a valid idempotency key and locale", () => {
    expect(errors({ idempotencyKey: "nope" })).toMatchObject({ idempotencyKey: "required" });
    expect(errors({ locale: "fr" })).not.toBeNull();
  });
});
