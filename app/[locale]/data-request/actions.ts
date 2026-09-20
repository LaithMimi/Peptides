"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { dataRequestSchema } from "@/lib/data-request-schema";
import { sendDataRequestEmail } from "@/lib/email";
import { checkRateLimit, submitLimit } from "@/lib/rate-limit";

export type DataRequestResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message: string };

export async function submitDataRequest(input: unknown): Promise<DataRequestResult> {
  const locale =
    typeof input === "object" &&
    input !== null &&
    "locale" in input &&
    (input as { locale: unknown }).locale === "ar"
      ? "ar"
      : "en";
  const t = await getTranslations({ locale, namespace: "errors" });

  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`data-request:${ip}`, submitLimit())) {
    return { ok: false, message: t("rateLimited") };
  }

  const parsed = dataRequestSchema.safeParse(input);
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

  // Honeypot: answer as if it succeeded so bots get no signal.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return { ok: true };
  }

  const result = await sendDataRequestEmail({
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  });
  if (!result.ok) {
    return { ok: false, message: t("dataRequestFailed") };
  }
  return { ok: true };
}
