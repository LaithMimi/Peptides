import { z } from "zod";
import { getProductById } from "./products";

export const MAX_LINE_QUANTITY = 10;
export const MAX_LINE_ITEMS = 50;
export const MAX_NAME_LENGTH = 200;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_ADDRESS_LENGTH = 500;
export const MAX_NOTES_LENGTH = 2000;

export const lineItemSchema = z
  .object({
    productId: z.string().min(1),
    vialId: z.string().min(1),
    quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
  })
  .refine(
    (item) => {
      const product = getProductById(item.productId);
      return !!product?.vials.some((v) => v.id === item.vialId);
    },
    { message: "itemUnavailable" }
  );

export const quoteRequestSchema = z.object({
  lineItems: z
    .array(lineItemSchema)
    .min(1, { message: "emptyCart" })
    .max(MAX_LINE_ITEMS, { message: "tooLong" })
    .refine(
      (items) =>
        new Set(items.map((i) => `${i.productId}:${i.vialId}`)).size ===
        items.length,
      { message: "duplicateItem" }
    ),
  customerName: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .max(MAX_NAME_LENGTH, { message: "tooLong" }),
  customerEmail: z
    .string()
    .trim()
    .email({ message: "invalidEmail" })
    .max(MAX_EMAIL_LENGTH, { message: "tooLong" }),
  shippingAddress: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .max(MAX_ADDRESS_LENGTH, { message: "tooLong" }),
  notes: z
    .string()
    .trim()
    .max(MAX_NOTES_LENGTH, { message: "tooLong" })
    .optional()
    .nullable(),
  ageAndResearchUseAck: z.literal(true, {
    error: "ackRequired",
  }),
  website: z.string().max(MAX_NAME_LENGTH).optional(),
  locale: z.enum(["en", "ar"]),
});

export type QuoteRequestFormValues = z.infer<typeof quoteRequestSchema>;

/**
 * Subset of the full schema covering only the fields the contact form
 * collects directly, for client-side feedback. The Server Action always
 * re-validates the complete `quoteRequestSchema` (including line items and
 * the acknowledgment) — this subset never replaces that server-side check.
 */
export const quoteContactFormSchema = quoteRequestSchema.omit({
  lineItems: true,
  locale: true,
});

export type QuoteContactFormValues = z.infer<typeof quoteContactFormSchema>;
