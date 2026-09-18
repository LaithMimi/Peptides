"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { quoteRequestSchema } from "@/lib/quote-schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { getProductById } from "@/lib/products";
import { sendQuoteRequestEmail } from "@/lib/email";
import type {
  QuoteRequestInput,
  QuoteRequestResult,
  ResolvedLineItem,
} from "@/types/catalog";

export async function submitQuoteRequest(
  input: QuoteRequestInput
): Promise<QuoteRequestResult> {
  const t = await getTranslations({ locale: input.locale, namespace: "errors" });

  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: t("rateLimited") },
    };
  }

  // Honeypot: real users never see this field. Answer as if it succeeded so
  // bots get no signal, but send nothing.
  if (input.website && input.website.trim().length > 0) {
    return { ok: true };
  }

  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "form";
      const code = typeof issue.message === "string" ? issue.message : "required";
      fieldErrors[key] = translateErrorCode(code, t);
    }
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors,
        message: t("genericSubmit"),
      },
    };
  }

  const data = parsed.data;

  const resolvedLineItems: ResolvedLineItem[] = [];
  for (const item of data.lineItems) {
    const product = getProductById(item.productId);
    const vial = product?.vials.find((v) => v.id === item.vialId);
    if (!product || !vial) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          fieldErrors: { lineItems: t("itemUnavailable", { name: item.productId }) },
          message: t("itemUnavailable", { name: item.productId }),
        },
      };
    }
    resolvedLineItems.push({
      ...item,
      productName: product.name,
      vialLabel: vial.label,
    });
  }

  const submittedAt = new Date().toISOString();
  const emailResult = await sendQuoteRequestEmail({
    request: data,
    resolvedLineItems,
    submittedAt,
  });

  if (!emailResult.ok) {
    return {
      ok: false,
      error: {
        code: "EMAIL_DELIVERY_FAILED",
        message: t("emailFailed"),
      },
    };
  }

  return { ok: true };
}

function translateErrorCode(
  code: string,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const known = ["required", "invalidEmail", "emptyCart", "ackRequired"];
  if (known.includes(code)) {
    return t(code);
  }
  // itemUnavailable and any unrecognized code need context this helper
  // doesn't have — callers handle those cases explicitly before reaching here.
  return t("genericSubmit");
}
