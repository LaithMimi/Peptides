"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { dataRequestSchema } from "@/lib/data-request-schema";
import { sendDataRequestEmail } from "@/lib/email";
import { saveInboundMessage } from "@/lib/db/queries/messages";
import { checkLimit, limits } from "@/lib/rate-limit-db";

export type DataRequestResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message: string };

const hashIp = (ip: string) => createHash("sha256").update(ip).digest("hex").slice(0, 32);

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
  if (!(await checkLimit(`data-request:ip:${hashIp(ip)}`, limits.submitPerIp()))) {
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

  try {
    await saveInboundMessage({
      kind: "data_request",
      email: parsed.data.email,
      orderPhone: parsed.data.phone || null,
      body: parsed.data.details || null,
      requestType: parsed.data.type,
      locale: parsed.data.locale,
    });
  } catch (err) {
    console.error("Failed to store data request", err);
    return { ok: false, message: t("dataRequestFailed") };
  }

  const result = await sendDataRequestEmail({
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  });
  if (!result.ok) console.error("Data request saved but notification email failed");
  return { ok: true };
}
