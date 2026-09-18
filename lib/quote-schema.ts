import { z } from "zod";
import { getProductById } from "./products";

// Only +972 (Israel) and +970 (Palestine) numbers are accepted: the country
// code, then an 8-9 digit national number (no trunk "0"), with common
// separators (space, dash, dot, parentheses) allowed anywhere.
function isValidPhone(value: string): boolean {
  if (!/^\+[\d\s().-]+$/.test(value)) return false;
  return /^\+97[02]\d{8,9}$/.test(value.replace(/[\s().-]/g, ""));
}

export const lineItemSchema = z
  .object({
    productId: z.string().min(1),
    vialId: z.string().min(1),
    quantity: z.number().int().min(1).max(20),
  })
  .refine(
    (item) => {
      const product = getProductById(item.productId);
      return !!product?.vials.some((v) => v.id === item.vialId);
    },
    { message: "itemUnavailable" }
  );

export const addressSchema = z.object({
  line1: z.string().trim().min(1, { message: "required" }),
  line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1, { message: "required" }),
  region: z.string().trim().min(1, { message: "required" }),
  postalCode: z.string().trim().min(1, { message: "required" }),
  country: z.string().trim().min(1, { message: "required" }),
});

export const quoteRequestSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1, { message: "emptyCart" }),
  customerName: z.string().trim().min(1, { message: "required" }),
  customerEmail: z.string().trim().email({ message: "invalidEmail" }),
  customerPhone: z
    .string()
    .trim()
    .min(1, { message: "required" })
    .refine(isValidPhone, { message: "invalidPhone" }),
  shippingAddress: addressSchema,
  notes: z.string().trim().optional().nullable(),
  ageAndResearchUseAck: z.literal(true, {
    error: "ackRequired",
  }),
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
