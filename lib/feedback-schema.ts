import { z } from "zod";

export const feedbackSchema = z.object({
  name: z.string().trim().optional().nullable(),
  email: z.string().trim().email({ message: "invalidEmail" }),
  message: z.string().trim().min(1, { message: "required" }),
  locale: z.enum(["en", "ar"]),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

/** Subset the client form collects; locale is attached at submit time. */
export const feedbackContactFormSchema = feedbackSchema.omit({ locale: true });

export type FeedbackContactFormValues = z.infer<typeof feedbackContactFormSchema>;
