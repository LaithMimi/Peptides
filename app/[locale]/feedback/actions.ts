"use server";

import { getTranslations } from "next-intl/server";
import { feedbackSchema } from "@/lib/feedback-schema";
import { sendFeedbackEmail } from "@/lib/email";

export type FeedbackResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message: string };

export async function submitFeedback(input: unknown): Promise<FeedbackResult> {
  const locale =
    typeof input === "object" &&
    input !== null &&
    "locale" in input &&
    (input as { locale: unknown }).locale === "ar"
      ? "ar"
      : "en";
  const t = await getTranslations({ locale, namespace: "errors" });

  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    const known = ["required", "invalidEmail"];
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "form";
      const code = typeof issue.message === "string" ? issue.message : "required";
      fieldErrors[key] = known.includes(code) ? t(code) : t("genericSubmit");
    }
    return { ok: false, fieldErrors, message: t("genericSubmit") };
  }

  const result = await sendFeedbackEmail({
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  });

  if (!result.ok) {
    return { ok: false, message: t("feedbackFailed") };
  }
  return { ok: true };
}
