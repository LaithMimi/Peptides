import { z } from "zod";

export const DATA_REQUEST_TYPES = ["delete", "access", "correct"] as const;

// Error messages are short codes, translated where they are rendered
// (see CLAUDE.md, "Error-code translation pattern").
export const dataRequestSchema = z.object({
  type: z.enum(DATA_REQUEST_TYPES, { message: "required" }),
  email: z.string().trim().email({ message: "invalidEmail" }),
  phone: z.string().trim().optional().nullable(),
  details: z.string().trim().optional().nullable(),
  locale: z.enum(["en", "ar"]),
  // Honeypot: real visitors never fill this in.
  website: z.string().optional().nullable(),
});

export type DataRequestValues = z.infer<typeof dataRequestSchema>;

/** Subset the client form collects; locale is attached at submit time. */
export const dataRequestFormSchema = dataRequestSchema.omit({ locale: true });
export type DataRequestFormValues = z.infer<typeof dataRequestFormSchema>;
