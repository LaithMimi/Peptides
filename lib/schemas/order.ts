import { z } from "zod";
import { parseCustomerPhone } from "@/lib/phone";

// Error `message` values are short codes, mapped to translated text by the UI
// (never rendered raw): required, tooShort, tooLong, invalidPhone, ackRequired,
// emptyCart, tooManyLines, duplicateItem.

export const MAX_ORDER_LINES = 30;
/** Hard upper bound in the schema; the store's `max_line_quantity` setting is enforced on the server. */
export const ABSOLUTE_MAX_QUANTITY = 100;

export const cartLineSchema = z.object({
  productId: z.string().uuid({ message: "required" }),
  quantity: z
    .number()
    .int({ message: "required" })
    .min(1, { message: "required" })
    .max(ABSOLUTE_MAX_QUANTITY, { message: "quantityTooHigh" }),
});

export const cartItemsSchema = z
  .array(cartLineSchema)
  .min(1, { message: "emptyCart" })
  .max(MAX_ORDER_LINES, { message: "tooManyLines" })
  .refine((items) => new Set(items.map((i) => i.productId)).size === items.length, {
    message: "duplicateItem",
  });

/** Fields the customer types in the checkout form (also used for client-side feedback). */
export const customerDetailsSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .min(2, { message: "tooShort" })
    .max(120, { message: "tooLong" }),
  customerPhone: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .transform((value, ctx) => {
      const phone = parseCustomerPhone(value);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "invalidPhone" });
        return z.NEVER;
      }
      return phone;
    }),
  deliveryAddress: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .min(5, { message: "tooShort" })
    .max(500, { message: "tooLong" }),
  notes: z
    .string()
    .trim()
    .max(1000, { message: "tooLong" })
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  acknowledged: z.literal(true, { error: "ackRequired" }),
});

/**
 * Client-side form feedback only: the checkbox holds a boolean while typing.
 * The server always re-validates with `placeOrderSchema`.
 */
export const customerFormSchema = customerDetailsSchema.extend({
  acknowledged: z.boolean().refine((v) => v === true, { message: "ackRequired" }),
});

export const placeOrderSchema = customerDetailsSchema.extend({
  idempotencyKey: z.string().uuid({ message: "required" }),
  locale: z.enum(["en", "ar"]),
  items: cartItemsSchema,
  /**
   * The total the customer last saw. NEVER used as the order total: it only
   * lets the server detect a price change and ask the customer to review.
   */
  expectedTotalMinor: z.number().int().nonnegative().optional(),
});

export type PlaceOrderInput = z.input<typeof placeOrderSchema>;
export type PlaceOrderParsed = z.output<typeof placeOrderSchema>;

/** First error code per top-level field, for `fieldErrors` in action results. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
